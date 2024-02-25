import os
from datetime import timedelta
from flask import Flask, request, jsonify
from models import db, User, Evento, Respuesta, Invitacion, Rechazado
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, create_access_token, get_jwt_identity, jwt_required
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from dotenv import load_dotenv


load_dotenv()

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///project.db"
app.config["JWT_SECRET_KEY"] = os.getenv("SUPER_SECRET_KEY")  # Corregir el nombre de la clave
app.config["SECRET_KEY"] = os.getenv("PASS_KEY")

app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=3)

jwt = JWTManager(app) #

db.init_app(app)
migrate = Migrate(app, db)
CORS(app)
jwt = JWTManager(app)
bcrypt = Bcrypt(app)
expires = timedelta(minutes=30)


@app.route("/register", methods=["POST"])
def register():
  user = User()
  email = request.json.get("email")
  username = request.json.get("username")
  user_exist = User.query.filter_by(username=username).first()
  email_exist = User.query.filter_by(email=email).first()
  if user_exist:
    return jsonify({"msg": "Nombre de usuario ya en uso"}), 400
  elif email_exist:
    return jsonify({"msg": "Email ya en uso"}), 400
  else:
    user.username = username
    user.email = request.json.get("email")
    user.name = request.json.get("name")
    user.phone = request.json.get("phone")
    user.address =request.json.get("address")
    user.premium = request.json.get("premium")
    user.active = True

    password = request.json.get("password")
    password_hash = bcrypt.generate_password_hash(password)
    user.password = password_hash

    db.session.add(user)
    db.session.commit()

    return jsonify({"msg": "user created successfully!!!"}), 201
  
@app.route("/edit_profile", methods=["PUT"])
@jwt_required()
def editProfile():
  user = User.query.get(request.json.get("userID"))
  user.name = request.json.get("name")
  user.phone = request.json.get("phone")
  user.address = request.json.get("address")
  password = request.json.get("password")
  if password is not None:
    password_hash = bcrypt.generate_password_hash(password)
    user.password = password_hash

  db.session.commit()

  return jsonify({"msg": "editedUser"}), 201

@app.route("/user", methods=["POST"]) #para encontrar las id al hacer invitaciones
@jwt_required()
def singleUser():
  search_query = request.json.get("search_query")
  user = User.query.filter_by(username=search_query).first()
  if user is None:
    user = User.query.filter_by(email=search_query).first()
  if user is None or user.active is False:
    return jsonify({
      "err":"no user found"
    }),404
  else:
    user = user.to_dict()
    return jsonify({
    "data":user
    }),200
  
@app.route("/user_details", methods=["POST"])
@jwt_required()
def currentUser():
  userID = request.json.get("userID")
  user = User.query.get(userID)
  user = user.to_dict()
  return jsonify({
    "data":user
  }),200

@app.route("/login", methods=["POST"])
def login():
  username = request.json.get("username")
  password = request.json.get("password")

  user_exist = User.query.filter_by(username=username).first()

  if user_exist is not None:
    if bcrypt.check_password_hash(user_exist.password, password):
      token = create_access_token(identity=username, expires_delta = expires)

      return jsonify({
        "token": token,
        "username": user_exist.username,
        "user_id": user_exist.id,
        "premium": user_exist.premium 
      }), 200
    else:
      return jsonify({"error": "Wrong credencials"}), 401
  else:
    return jsonify({"error": "User does not exists"}), 404

  
@app.route("/create_event", methods=["POST"])
@jwt_required()
def create_event():
  evento = Evento()
  evento.name = request.json.get("name")
  evento.lugar = request.json.get("lugar")
  evento.inicio =request.json.get("inicio")
  evento.final =request.json.get("final")
  evento.duracion =request.json.get("duracion")
  evento.descripcion =request.json.get("descripcion")
  evento.idOrganizador =request.json.get("idOrganizador")
  evento.privacidad1 =request.json.get("privacidad1")
  evento.privacidad2=request.json.get("privacidad2")
  evento.privacidad3=request.json.get("privacidad3")
  evento.privacidad4=request.json.get("privacidad4")
  evento.requisitos1=request.json.get("requisitos1")
  evento.requisitos2=request.json.get("requisitos2")
  evento.requisitos3=request.json.get("requisitos3")
  evento.requisitos4=request.json.get("requisitos4")
  evento.respondidos=request.json.get("respondidos")
  evento.mapsQuery=request.json.get("mapsQuery")

  db.session.add(evento)
  db.session.flush()
  print(evento.id)
  db.session.commit()
  return jsonify({"msg": "Evento creado satisfactoriamente",
                  "id":evento.id}), 201

@app.route("/edit_event", methods=["PUT"])
@jwt_required()
def edit_event():
  idEvento=request.json.get("idEvento")
  evento=Evento.query.get(idEvento)
  evento.name = request.json.get("name")
  evento.lugar = request.json.get("lugar")
  evento.inicio =request.json.get("inicio")
  evento.final =request.json.get("final")
  evento.duracion =request.json.get("duracion")
  evento.descripcion =request.json.get("descripcion")
  evento.privacidad1 =request.json.get("privacidad1")
  evento.privacidad2=request.json.get("privacidad2")
  evento.privacidad3=request.json.get("privacidad3")
  evento.privacidad4=request.json.get("privacidad4")
  evento.requisitos1=request.json.get("requisitos1")
  evento.requisitos2=request.json.get("requisitos2")
  evento.requisitos3=request.json.get("requisitos3")
  evento.requisitos4=request.json.get("requisitos4")
  evento.mapsQuery=request.json.get("mapsQuery")


  db.session.commit()
  return jsonify({"msg": "Evento editado satisfactoriamente"
                  }), 201

@app.route("/user_participation", methods=["PUT"])
@jwt_required()
def user_participation():
  idInvitado=request.json.get("idInvitado")
  eventos = []
  respuestas=Respuesta.query.filter_by(idInvitado=idInvitado)
  invitaciones=Invitacion.query.filter_by(idInvitado=idInvitado)
  rechazos=Rechazado.query.filter_by(idInvitado=idInvitado)
  for invitacion in invitaciones:
    eventos.append({"idEvento":invitacion.evento.id,"name":invitacion.evento.name,"lugar":invitacion.evento.lugar,"inicio":invitacion.evento.inicio,"final":invitacion.evento.final})

  respuestas=list(map(lambda respuesta:respuesta.to_dict(),respuestas))
  invitaciones=list(map(lambda Invitacion:Invitacion.to_dict(),invitaciones))
  rechazos=list(map(lambda rechazo:rechazo.to_dict(),rechazos))


  return jsonify({
    "invitaciones": invitaciones,
    "respuestas": respuestas,
    "rechazos": rechazos,
    "eventosInv" : eventos
  }),200

  


@app.route("/event", methods=["POST"]) 
@jwt_required()
def evento():
  idEvento = request.json.get("eventID")
  evento = Evento.query.filter_by(id=idEvento).first()
  evento = evento.to_dict()
  return jsonify({
    "data": evento
  }),200

@app.route("/delete_event", methods=["DELETE"])
@jwt_required()
def delete_event():
    idEvento = request.json.get("idEvento")
    evento = Evento.query.filter_by(id=idEvento).first()
    invitaciones = Invitacion.query.filter(Invitacion.idEvento == idEvento).all()
    respuestas = Respuesta.query.filter(Respuesta.idEvento == idEvento).all()
    rechazos = Rechazado.query.filter(Rechazado.idEvento == idEvento).all()

    for invitacion in invitaciones:
        db.session.delete(invitacion)

    for respuesta in respuestas:
        db.session.delete(respuesta)

    for rechazo in rechazos:
        db.session.delete(rechazo)

    db.session.delete(evento)
    db.session.commit()

    return jsonify({
        "msg": "Event deleted successfully"
    }), 200

@app.route("/events",methods=["GET"])
@jwt_required()
def eventos():
    eventos = Evento.query.all()
    eventos = list(map(lambda evento: evento.to_dict(), eventos))

    return jsonify({
    "data": eventos
  }), 200

@app.route("/event_org_data", methods=["POST"])
@jwt_required()
def infoOrganizador():
  eventID = request.json.get("eventID")
  evento = Evento.query.get(eventID)
  detalles_organizador = {"username":evento.user.username,"name":evento.user.name}
  return jsonify({
    "data":detalles_organizador

  }),200
  
@app.route("/add_invitee", methods=["POST"]) #para ejecutar esto hay que hacer utilizar un query que encuentre la id del invitado por username o email
@jwt_required()
def add_invitee():
  invitacion = Invitacion()
  target_event=request.json.get("target_event")
  id_invitee = request.json.get("idInvitado")
  imprescindible = request.json.get("imprescindible")
  invitee_exists = Invitacion.query.filter_by(idInvitado=id_invitee).filter_by(idEvento=target_event).first()
  if (invitee_exists):
    return jsonify({
      "msg": "El usuario ya está invitado"
    }),409
  else:
    invitacion.idEvento = target_event
    invitacion.imprescindible = imprescindible
    invitacion.idInvitado = id_invitee

    db.session.add(invitacion)
    db.session.commit()
    return jsonify({
      "msg": "invitacion creada satisfactoriamente"
    }),201

@app.route("/invitees",methods=["POST"])
@jwt_required()
def invitees_in_event():
  idEvento = request.json.get("idEvento")
  invitees = Invitacion.query.filter_by(idEvento=idEvento)
  invitees = list(map(lambda invitee: invitee.to_dict(), invitees))

  return jsonify({
    "data": invitees
  }), 200

@app.route("/inv_resp_rej",methods=["POST"])
@jwt_required()
def invites_responses():
  userID = request.json.get("userID")
  invitaciones = Invitacion.query.filter_by(idInvitado=userID)
  respuestas = Respuesta.query.filter_by(idInvitado=userID)
  rechazos = Rechazado.query.filter_by(idInvitado=userID)
  invitaciones = list(map(lambda invitacion: invitacion.to_dict(), invitaciones))
  respuestas = list(map(lambda respuesta: respuesta.to_dict(),respuestas))
  rechazos = list(map(lambda rechazo: rechazo.to_dict(),rechazos))
  return jsonify({
    "invitaciones": invitaciones,
    "respuestas" : respuestas,
    "rechazos":rechazos
  }), 200

@app.route("/toggle_imprescindible",methods=["PUT"])
@jwt_required()
def imprescindible():
  invitation_id=request.json.get("invitation_id")
  invitation = Invitacion.query.get(invitation_id)
  invitation.imprescindible = not invitation.imprescindible

  db.session.commit()
  return jsonify({
    "data":invitation.imprescindible
  }),200

@app.route("/invitee_details",methods=["POST"])
@jwt_required()
def invitees_details():
  idEvento = request.json.get("idEvento")
  invitees = Invitacion.query.filter_by(idEvento=idEvento).all()
  user_details = []
  for invitee in invitees:
    user_details.append({
      "invitation_id":invitee.id,
      "imprescindible":invitee.imprescindible,
      "user_details":{
        "idInvitado":invitee.user.id,
        "username":invitee.user.username,
        "name":invitee.user.name
      }
    })
  print(user_details)
  return jsonify({"data":user_details}),200
  

@app.route("/delete_invitee", methods=["DELETE"]) 
@jwt_required()
def delete_invitee():
  id = request.json.get("invitation_id")
  invitacion=Invitacion.query.filter_by(id=id).first()
  respuestas = Respuesta.query.filter_by(idEvento=invitacion.idEvento).filter_by(idInvitado=invitacion.idInvitado)
  for respuesta in respuestas:
    db.session.delete(respuesta)
  db.session.delete(invitacion)
  db.session.commit()
  return jsonify({
    "msg":"user uninvited succesfully"
  }),200

@app.route("/schedule_entry", methods=["POST"]) #errores se agarran en front end
@jwt_required()
def schedule_entry():
  respuesta = Respuesta()
  idEvento = request.json.get("idEvento")
  idInvitado = request.json.get("idInvitado")
  rechazo = Rechazado.query.filter_by(idEvento=idEvento).filter_by(idInvitado=idInvitado).first()
  respuesta.idEvento = idEvento
  respuesta.idInvitado = idInvitado
  respuesta.fecha = request.json.get("fecha")
  respuesta.inicio = request.json.get("inicio")
  respuesta.final = request.json.get("final")
  print(rechazo)
  if (rechazo):# si el evento esta rechazado, agregar una respuesta elimina el rechazo
    db.session.delete(rechazo)

  db.session.add(respuesta)
  db.session.commit()
  return jsonify({
    "msg": "bloque agregado"
  }),201

@app.route("/schedules",methods=["POST"])
@jwt_required()
def gather_schedules():
  idEvento= request.json.get("idEvento")
  respuestas = Respuesta.query.filter_by(idEvento=idEvento)
  respuestas = list(map(lambda respuesta: respuesta.to_dict(), respuestas))
  return jsonify({
    "data":respuestas
    }),200

@app.route("/schedule_delete", methods=["DELETE"])
@jwt_required()
def schedule_delete():
  id_respuesta=request.json.get("id")
  respuesta = Respuesta.query.filter_by(id=id_respuesta).first()
  
  db.session.delete(respuesta)
  db.session.commit()

  return jsonify({
    "msg":"bloque eliminado satisfactoriamente"
  }),200

@app.route("/reject", methods=["POST"]) #errores se agarran en front end
@jwt_required()
def reject():
  rejection = Rechazado()
  idEvento = request.json.get("eventID")
  idInvitado = request.json.get("inviteeID")
  rechazo = Rechazado.query.filter_by(idEvento=idEvento).filter_by(idInvitado=idInvitado).first()
  if (rechazo):
    return jsonify({
      "msg":"el usuario ya ha rechazado el evento"
    })
  else:
    respuestas = Respuesta.query.filter_by(idEvento=idEvento).filter_by(idInvitado=idInvitado)
    for respuesta in respuestas:
      db.session.delete(respuesta)
    rejection.idEvento = idEvento
    rejection.idInvitado = idInvitado 
    
    db.session.add(rejection)
    db.session.commit()

    return jsonify({
    "msg":"evento rechazado satisfactoriamente"
    }),201

@app.route("/rejections",methods=["POST"])
@jwt_required()
def get_rejections():
  idEvento=request.json.get("idEvento")
  rejections=Rechazado.query.filter_by(idEvento=idEvento)
  if rejections is None:
    return jsonify({
      "data":[],
      "msg":"no rejections yet"
    }),200
  rejections=list(map(lambda rejection:rejection.to_dict(),rejections))
  return jsonify({
    "data":rejections
  }),200

@app.route("/auth",methods=["POST"])
@jwt_required()
def get_auth():
  username=request.json.get("username")
  user_logged=User.query.filter_by(username=username).first()
  if user_logged:
    return jsonify({
      "msg":"auth verified"
    }),200

if __name__ == "__main__":
  app.run(host="localhost", port=5000)