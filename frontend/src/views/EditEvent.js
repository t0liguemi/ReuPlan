import { useState, useEffect, useContext } from "react";
import { Context } from "../store/context";
import { Navigate } from "react-router";
import { useNavigate, useParams, Link } from "react-router-dom";
import "./editEvent.css";

function EditEvent() {
  const { eventID } = useParams();
  const { store, actions } = useContext(Context);
  const [eventoCreado, setEventoCreado] = useState(false);
  const [usuarioExiste, setUsuarioExiste] = useState(true);
  const navigate = useNavigate();
  const currentUser = localStorage.getItem("reuPlanUserID")

  function submitHandler(e) {
    actions.editEvent(e, eventID);
  }
  function newInvite(e) {
    const targetUser = e.target[1].value;
    actions.queryUser(targetUser, setUsuarioExiste);
  }

  useEffect(() => {
    fetch("http://localhost:5000/auth", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("reuPlanToken"),
      },
      body: JSON.stringify({
        username: localStorage.getItem("reuPlanUser"),
      }),
    })
      .then((resp) => {
        if (resp.status == 401 || resp.status == 422) {
          navigate("/login");
          actions.triggerGeneralToast(
            "Inicia sesión para continuar",
            "danger"
          );
          store.loggedIn = false;
          localStorage.removeItem("reuPlanUser");
          localStorage.removeItem("reuPlanUserID");
          localStorage.removeItem("reuPlanCurrentEvent");
          localStorage.removeItem("reuPlanToken");
        }
        if (resp.status == 200) {
          actions.getEvent(eventID);
          actions.findInviteesDetails(eventID);
          store.loggedIn = true;
          if (store.fetchedEvent.idOrganizador!=currentUser){
            navigate("/eventList")
            actions.triggerGeneralToast("No tienes acceso a esta vista","danger")
          } 
        }
      })
      .then((data) => {})
      .catch((error) => {});
    return () => {
      store.inviteesDetails = [];
    };
  }, [store.loggedIn, store.yaInvitado]);

  if (!store.loggedIn) {
    return <Navigate to="/login" />;
  } else {
    return (
      <div>
        <div className="floating-title">
          <Link
            to={"/evento/" + eventID}
            className="fs-5 btn bg-secondary fw-semibold py-2 px-2 text-white"
          >
            Volver a la vista de evento
          </Link>
        </div>

        <div className="container py-4">
          <header className="fs-2 fw-semibold pb-3">Detalles del evento</header>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitHandler(e);
            }}
          >
            <fieldset disabled={eventoCreado}>
              <div className="d-flex align-items-center w-100">
                <label className="fs-3 fw-semibold w-75" htmlFor="eventName">
                  Nombre del evento
                  <input
                    name="eventName"
                    type="text"
                    className="form-control my-1 fs-4"
                    placeholder="nombre de tu evento"
                    defaultValue={store.fetchedEvent.name}
                    required
                  />
                </label>
              </div>
              <div className="mt-3 mb-5">
                <div className="row w-75 align-items-start justify-content-start">
                  <div className="col-sm d-flex align-items-center me-4 ">
                    <label className="w-75 me-2 fw-semibold fs-3">
                      Desde el día:
                    </label>
                    <input
                      type="date"
                      className="flex-shrink form-control"
                      defaultValue={store.fetchedEvent.inicio}
                    ></input>
                  </div>
                  <div className="col-sm d-flex align-items-center ">
                    <label className="w-75 me-2 fw-semibold fs-3">
                      Hasta el día:
                    </label>
                    <input
                      type="date"
                      className="flex-shrink-1 flex-fill form-control"
                      required
                      defaultValue={store.fetchedEvent.final}
                    ></input>
                  </div>
                </div>
                <p className="text-secondary fw-semibold">
                  Estos son los días en que los invitados podrán ingresar los
                  horarios en que podrían asistir a tu evento.
                </p>
              </div>
              <div className="row d-flex align-items-center my-2">
                <div className="col-sm d-flex align-items-center me-4">
                  <h4 className="fw-semibold me-2">Duración:</h4>
                  <input className="form-control w-50" type="number"></input>
                </div>
                <div className="col-sm my-2 d-flex align-items-center">
                  <h4 className="me-2 fw-semibold">Lugar:</h4>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="lugar(presencial) / app(online)"
                    defaultValue={store.fetchedEvent.lugar}
                  ></input>
                </div>
                <div className="col-sm d-flex flex-column my-2">
                  <div className="d-flex">
                    <label
                      className="fw-semibold fs-5"
                      htmlFor="formMapQuery"
                    >
                      Buscar y mostrar ubicación en un mapa{" "}
                      <input
                        type="checkbox"
                        className="form-check-input mx-2"
                        defaultChecked
                        id="formMapQuery"
                      ></input>
                    </label>
                  </div>
                  <br />
                  <small className="text-secondary fs-6 fw-semibold">
                    Para mayor precisión escribe una dirección, nombre de
                    edificio o institución junto a ciudad o código postal.
                  </small>
                </div>
              </div>
              <h4 className="fw-semibold"> Descripción</h4>
              <textarea
                defaultValue={store.fetchedEvent.descripcion}
                className="form-control w-75"
              ></textarea>
              <div className="my-4 row">
                <div className="col-sm d-flex flex-column">
                  <h3 className="fw-semibold">Privacidad</h3>
                  <h4 className="fw-semibold">Usuarios Pueden:</h4>
                  <div className="form-check py-2  ">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="checkCantidadInvitados"
                      defaultChecked={store.fetchedEvent.privacidad1}
                    />
                    <label
                      htmlFor="checkCantidadInvitados"
                      className="form-check-label fs-5 fw-semibold"
                    >
                      Ver cuántos invitados hay
                    </label>
                  </div>
                  <div className="form-check ms-5 py-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="checkInvitadosID"
                      defaultChecked={store.fetchedEvent.privacidad2}
                    />
                    <label
                      htmlFor="checkInvitadosID"
                      className="form-check-label fs-5 fw-semibold"
                    >
                      Ver a otros invitados
                    </label>
                  </div>
                  <div className="form-check ms-5 py-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="checkRespuestasInvitados"
                      defaultChecked={store.fetchedEvent.privacidad3}
                    />
                    <label
                      htmlFor="checkRespuestasInvitados"
                      className="form-check-label fs-5 fw-semibold"
                    >
                      Ver quienes han respondido
                    </label>
                  </div>
                  <div className="form-check py-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="checkInvitadosImprescindibles"
                      defaultChecked={store.fetchedEvent.privacidad4}
                    />
                    <label
                      htmlFor="checkInvitadosImprescindibles"
                      className="form-check-label fs-5 fw-semibold"
                    >
                      Saber si hay, o no, invitados imprescindibles
                    </label>
                  </div>
                </div>
                <div className="col-sm d-none flex-column fw-semibold">
                  <h3 className="fw-semibold">Requisitos de aceptación:</h3>
                  <h4 className="fw-semibold">Asistentes deben tener:</h4>
                  <div className="d-flex flex-column">
                    <div className="col-6 form-check py-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="checkEmail"
                        defaultChecked={store.fetchedEvent.requisitos1}
                        disabled
                      />
                      <label
                        htmlFor="checkEmail"
                        className="form-check-label fs-5 fw-semibold"
                      >
                        Email verificado
                      </label>
                    </div>
                    <div className="col-6 form-check py-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="checkNombre"
                        defaultChecked={store.fetchedEvent.requisitos2}
                        disabled
                      />
                      <label
                        htmlFor="checkNombre"
                        className="form-check-label fs-5 fw-semibold"
                      >
                        Nombre
                      </label>
                    </div>
                    <div className="col-6 form-check py-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="checkTelefono"
                        defaultChecked={store.fetchedEvent.requisitos3}
                        disabled
                      />
                      <label
                        htmlFor="checkTelefono"
                        className="form-check-label fs-5 fw-semibold"
                      >
                        Número de teléfono
                      </label>
                    </div>
                    <div className="col-6 form-check py-2">
                      <input
                        className="form-check-input fw-semibold"
                        type="checkbox"
                        id="checkDireccion"
                        defaultChecked={store.fetchedEvent.requisitos4}
                        disabled
                      />
                      <label
                        htmlFor="checkDireccion"
                        className="form-check-label fs-5 fw-semibold"
                      >
                        Dirección
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="d-flex justify-content-center">
                <button
                  className="btn btn-primary px-5 my-3 fw-semibold fs-5 w-75"
                  type="submit"
                >
                  Guardar Cambios
                </button>
              </div>
            </fieldset>
          </form>

          {/* ---------------------Sección de creación de invitados------------ */}
          <div>
            <hr />
            <div className="d-flex flex-column my-5">
            <div className="d-flex mb-4 align-items-center">
                <h2 className="fw-semibold">Invitados</h2>
                <button
                  type="button"
                  className="btn btn-primary px-3 py-2 ms-4 fw-semibold fs-5 align-self-center"
                  data-bs-toggle="modal"
                  data-bs-target="#exampleModal"
                >
                  Agregar invitado
                </button>
              </div>

              <h5 className="fw-semibold">
                Los contactos recibirán una invitación para incorporar sus
                propios bloques de disponibilidad en el calendario de
                asistencia, el cual, de forma automática, calculará los bloques
                en que todos los invitados participantes tienen la posibilidad
                de asistir.
                <br />
                <br />
                Los invitados agregados pueden ser indicados como
                imprescindible.
                <br />
                En caso de que un invitado indispensable rechace la invitación
                el evento será marcado como inviable.
                <br />
                <br />
                Los usuarios se muestran como "Nombre (Nombre de usuario)"
                <br />
                <span className="text-primary">
                  Eres organizador y asistente? No olvides incluirte en la lista
                  de invitados también!
                </span>
                <br />
              </h5>
              <div className="py-4">
                <ul className="w-75 my-2 list-group list-group-flush">
                  {store.inviteesDetails.length > 0 &&
                    store.inviteesDetails.map((invitation) => {
                      return (
                        <li
                          className="list-group-item fs-4 fw-semibold"
                          key={"user_" + invitation.invitation_id}
                        >
                          <div className="row d-flex align-items-center">
                            <h5 className="col-md-6 fw-semibold">
                              {invitation.user_details.name}{" "}
                              <span className="fw-medium">
                                ({invitation.user_details.username})
                              </span>
                            </h5>
                            <div className="form-check col-md-5">
                              {invitation.imprescindible == false ? (
                                <button
                                  onClick={() =>
                                    actions.toggleImprescindible(
                                      invitation.invitation_id
                                    )
                                  }
                                  htmlFor="checkImprescindible"
                                  className="btn btn-primary fs-5 fw-semibold"
                                >
                                  Hacer imprescindible
                                </button>
                              ) : (
                                <button
                                  onClick={() =>
                                    actions.toggleImprescindible(
                                      invitation.invitation_id
                                    )
                                  }
                                  htmlFor="checkImprescindible"
                                  className="btn btn-secondary fs-5 fw-semibold"
                                >
                                  Hacer prescindible
                                </button>
                              )}
                            </div>
                            <button
                              className="btn text-danger fw-bold fs-4 col-md-1"
                              onClick={() => {
                                actions.uninviteUser(invitation.invitation_id);
                              }}
                            >
                              X
                            </button>
                          </div>
                        </li>
                      );
                    })}
                </ul>
              </div>
            </div>
          </div>
          {/*-------------- MODAL DE ENVIAR INVITADOS ----------------*/}
          <div
            className="modal fade"
            id="exampleModal"
            tabIndex="-1"
            aria-labelledby="invitationModal"
            aria-hidden="true"
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h1
                    className="modal-title fs-4 fw-semibold"
                    id="invitationModal"
                  >
                    Agregar invitado
                  </h1>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button>
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    newInvite(e);
                  }}
                >
                  <fieldset>
                    <div className="modal-body">
                      <h5 className="fw-semibold">
                        Ingresa el nombre de usuario o e-mail del invitado
                      </h5>
                      {usuarioExiste == false && (
                        <p className="text-danger fw-bold">
                          Usuario no encontrado
                        </p>
                      )}
                      {store.yaInvitado == true && (
                        <p className="text-danger fw-bold">
                          Usuario ya invitado
                        </p>
                      )}
                      <input
                        type="text"
                        className="input form-control my-3"
                        placeholder="e-mail o nombre de usuario"
                        required
                      />
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary rounded-0 fw-semibold"
                        data-bs-dismiss="modal"
                      >
                        Close
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary fw-semibold"
                      >
                        Enviar invitación
                      </button>
                    </div>
                  </fieldset>
                </form>
              </div>
            </div>
          </div>
          <hr className="my-5" />
          <h2 className="my-3">Eliminar evento</h2>
          <div className="d-flex justify-content-center">
            <button
              className="btn btn-danger px-5 my-3 fw-bold w-75"
              onClick={(e) => {
                e.preventDefault();
                if (
                  window.confirm(
                    "Estás seguro de eliminar este evento?\nEsta acción no se puede deshacer"
                  )
                ) {
                  actions.deleteEvent(eventID, navigate);
                }
              }}
            >
              Eliminar este evento permanentemente
            </button>
          </div>
        </div>
      </div>
    );
  }
}
export default EditEvent;
