from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(250))
    email = db.Column(db.String(250), nullable=False,unique=True)
    username = db.Column(db.String(200), nullable=False, unique=True)
    password = db.Column(db.String(200), nullable=False)
    address = db.Column(db.String(200))
    phone = db.Column(db.String(200))
    premium = db.Column(db.Boolean, nullable=False)
    active = db.Column(db.Boolean,nullable=False)
    eventosCreados = db.relationship("Evento", backref="user")
    invitaciones = db.relationship("Invitacion", backref="user")
    rechazos = db.relationship("Rechazado", backref="user")
    respuestas = db.relationship("Respuesta", backref="user")

    def to_dict(self):
        return {
            "id": self.id,
            "name":self.name,
            "email":self.email,
            "username": self.username,
            "premium": self.premium,
            "address": self.address,
            "phone_number": self.phone,
        }
    
class Evento(db.Model):
    __tablename__='event'
    id = db.Column(db.Integer, primary_key=True)
    name= db.Column(db.String(250), nullable=False)
    lugar = db.Column(db.String(250), nullable=False)
    idOrganizador = db.Column(db.ForeignKey("user.id"),nullable=False)
    inicio = db.Column(db.String, nullable=False)
    final = db.Column(db.String, nullable=False)
    duracion = db.Column(db.Integer)
    descripcion = db.Column(db.String(250))
    privacidad1 = db.Column(db.Boolean, nullable=False) #puede ver cuantos invitados
    privacidad2 = db.Column(db.Boolean, nullable=False) #puede ver que invitados
    privacidad3 = db.Column(db.Boolean, nullable=False) #puede ver quienes han respondidos
    privacidad4 = db.Column(db.Boolean, nullable=False) #puede ver invitados imprescindibles
    requisitos1 = db.Column(db.Boolean, nullable=False) #email
    requisitos2 = db.Column(db.Boolean, nullable=False) #
    requisitos3 = db.Column(db.Boolean, nullable=False)
    requisitos4 = db.Column(db.Boolean, nullable=False)
    respondidos = db.Column(db.Integer, nullable=False)
    mapsQuery = db.Column(db.Boolean, nullable=False)
    organizador = db.relationship("User")
    invitaciones = db.relationship("Invitacion", backref="evento")
    rechazos = db.relationship("Rechazado", backref="evento")
    respuestas = db.relationship("Respuesta", backref="evento")

    def to_dict(self):
        return {
            "id": self.id,
            "name":self.name,
            "lugar":self.lugar,
            "idOrganizador": self.idOrganizador,
            "inicio":self.inicio,
            "final": self.final,
            "lugar": self.lugar,
            "duracion": self.duracion,
            "descripcion": self.descripcion,
            "respondidos": self.respondidos,
            "privacidad1": self.privacidad1,
            "privacidad2": self.privacidad2,
            "privacidad3": self.privacidad3,
            "privacidad4": self.privacidad4,
            "requisitos1": self.requisitos1,
            "requisitos2": self.requisitos2,
            "requisitos3": self.requisitos3,
            "requisitos4": self.requisitos4,
            "mapsQuery": self.mapsQuery
        }

class Invitacion(db.Model):
    __tablename__='invitacion'
    id = db.Column(db.Integer, primary_key=True)
    idEvento =db.Column(db.ForeignKey("event.id"),nullable=False)
    idInvitado = db.Column(db.ForeignKey('user.id'),nullable=False)
    imprescindible = db.Column(db.Boolean,nullable=False)
    def to_dict(self):
        return {
            "id": self.id,
            "idEvento" :self.idEvento,
            "idInvitado" : self.idInvitado,
            "imprescindible" :self.imprescindible,
        }

class Respuesta(db.Model):
    __tablename__='respuesta'
    id = db.Column(db.Integer, primary_key=True)
    idEvento = db.Column(db.ForeignKey('event.id'),nullable=False)
    idInvitado = db.Column(db.ForeignKey('user.id'),nullable=False)
    fecha = db.Column(db.String, nullable=False)
    inicio = db.Column(db.Integer, nullable=False) #en formato militar 1:00 pm es 1300
    final = db.Column(db.Integer, nullable=False)
    def to_dict(self):
        return{
            "id":self.id,
            "idEvento":self.idEvento,
            "idInvitado":self.idInvitado,
            "fecha":self.fecha,
            "inicio":self.inicio,
            "final":self.final,
        }
    

class Rechazado(db.Model): #lista con los rechazos de los usuarios a los eventos
    __tablename__='rechazado'
    id = db.Column(db.Integer, primary_key=True)
    idEvento = db.Column(db.ForeignKey('event.id'),nullable=False)
    idInvitado = db.Column(db.ForeignKey('user.id'),nullable=False)
    def to_dict(self):
        return{
            "id":self.id,
            "idEvento":self.idEvento,
            "idInvitado":self.idInvitado,
        }
