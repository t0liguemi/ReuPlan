import Calendar from "../components/Calendario";
import React, { useEffect, useState, useContext } from "react";
import { Context } from "../store/context";
import { useParams, Navigate, useNavigate, Link } from "react-router-dom";
import ToastComponent from "../components/AlertToast";
import { act } from "react-dom/test-utils";

const Evento = (props) => {
  const apiKey = process.env.REACT_APP_API_KEY;
  const navigate = useNavigate();
  const { eventID } = useParams();
  const { store, actions } = useContext(Context);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState();
  const [userBlocks, setUserBlocks] = useState();
  const currentUser = localStorage.getItem("reuPlanUserID");
  const dateOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: 'America/Santiago'
  };
  const handleShowToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  useEffect(() => {
    localStorage.setItem("reuPlanCurrentEvent", eventID);
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
          actions.triggerGeneralToast("Inicia sesión para continuar", "danger");
          store.loggedIn = false;
        }
        if (resp.status == 200) {
          actions.mainEventView(eventID, navigate);
          store.loggedIn = true;
        }
      })
      .then((data) => {})
      .catch((error) => {});

    return () => {
      store.eventReady = false;
    };
  }, [store.loggedIn, store.updatedList]);

  if (store.loggedIn == false && store.eventReady == false) {
    return (
      <div className="d-flex justify-content-center align-content-center my-5 py-5">
        <div className="spinner-border" role="status"></div>
        <h5 className="text-secondary">Cargando</h5>
      </div>
    );
  } else if (store.eventReady == true) {
    return (
      <div className="container py-5">
        <div className="d-flex justify-content-between">
          <h1 className="fw-semibold">Evento: {store.evento.nombre}</h1>
          <div className="d-grid gap-2 d-sm-block align-self-center">
            <Link
              className="btn btn-success fw-semibold px-4 py-2 fs-5 mx-3"
              to="#editarAsistencia"
              onClick={() =>
                actions.triggerGeneralToast(
                  "Agrega un bloque para aceptar este evento o modificar tu asistencia",
                  "primary"
                )
              }
            >
              {store.bloquesUsuarioActual.length > 0
                ? "Modificar Asistencia"
                : store.evento.organizador == currentUser
                ? "Participar"
                : "Aceptar"}
            </Link>
            {currentUser == store.evento.organizador ? (
              <Link
                to={`/evento/${eventID}/edit`}
                className="btn btn-primary fw-semibold px-4 py-2 fs-5 mx-3"
              >
                Editar
              </Link>
            ) : store.currentEventsRejections.some(
                (rej) => rej.idInvitado == currentUser
              ) == true ? (
              <button className="btn btn-danger fw-semibold px-4 py-2 fs-5 mx-3">Rechazado</button>
            ) : (
              <button
                onClick={(e) => {
                  actions.rejectInvite(navigate);
                }}
                className="btn btn-danger fw-semibold px-4 py-2 fs-5 mx-3"
              >
                Rechazar
              </button>
            )}
          </div>
        </div>
        {store.currentEventsRejections.some(
          (rej) => rej.idInvitado == currentUser
        ) == true ? (
          <h4 className="text-danger px-0 mx-0 fw-semibold">
            Rechazaste este evento
          </h4>
        ) : (
          <></>
        )}
        {store.currentEventViability ? (
          <></>
        ) : (
          <h4 className="text-danger px-0 mx-0 fw-semibold">
            Este evento es inviable
          </h4>
        )}
        <div className="py-4">
          <div className="row">
            <h3 className="fw-semibold">
              Desde el{" "}
              {store.evento.inicio.toLocaleDateString("es", dateOptions)} hasta
              el {store.evento.final.toLocaleDateString("es", dateOptions)}
            </h3>
            <h3 className="fw-semibold">
              Duración: {store.evento.duracion} horas.
            </h3>
            {store.evento.lugar && (
              <h3 className="fw-semibold text-break">Lugar: {store.evento.lugar}</h3>
            )}
            {store.evento.privacidad[0] == true ? (
              <h3 className="fw-semibold">
                {store.currentEventsInvitees.length} invitaciones,{" "}
                {store.evento.respondidos.length} aceptada
                {store.evento.respondidos.length != 1 ? "s" : ""},{" "}
                {store.currentEventsRejections.length} rechazada
                {store.currentEventsRejections != 1 ? "s" : ""}.
              </h3>
            ) : (
              <></>
            )}
            <div className="row">
              <div className="col-sm-6">
                <h3 className="mt-4 fw-semibold">
                  Evento creado por{" "}
                  {store.hostData != undefined && store.hostData.name} (
                  {store.hostData != undefined && store.hostData.username})
                </h3>
                {store.evento.privacidad[1] == true ? (
                  <div>
                    <h3 className="mt-4 fw-semibold">Invitados:</h3>
                    <p>
                      {store.inviteesDetails.map((invitado, i) => {
                        if (
                          store.evento.respondidos.some(
                            (respondido) =>
                              invitado.user_details.idInvitado == respondido
                          )
                        ) {
                          return (
                            <span
                              className="text-success fw-semibold"
                              key={"inv" + invitado.invitation_id}
                            >
                              {invitado.user_details.name} (
                              {invitado.user_details.username})
                              {i != store.evento.invitados.length - 1
                                ? ","
                                : ""}{" "}
                            </span>
                          );
                        } else if (
                          store.currentEventsRejections.find(
                            (rej) =>
                              rej.idInvitado == invitado.user_details.idInvitado
                          )
                        ) {
                          return (
                            <span
                              className="text-danger fw-semibold"
                              key={"invitation" + invitado.invitation_id}
                            >
                              {invitado.user_details.name} (
                              {invitado.user_details.username})
                              {i != store.evento.invitados.length - 1
                                ? ","
                                : ""}{" "}
                            </span>
                          );
                        } else {
                          return (
                            <span
                              className="fw-semibold"
                              key={"invitation" + invitado.invitation_id}
                            >
                              {invitado.user_details.name} (
                              {invitado.user_details.username})
                              {i != store.evento.invitados.length - 1
                                ? ","
                                : ""}{" "}
                            </span>
                          );
                        }
                      })}
                    </p>
                  </div>
                ) : (
                  <></>
                )}
                {store.evento.privacidad[3] == true ? (
                  <p className="pt-4 fw-semibold">
                    <span className="fs-4">Invitados imprescindibles:</span>
                    <br />
                    {store.inviteesDetails.some(
                      (inv) => inv.imprescindible == true
                    ) ? (
                      store.inviteesDetails.map((inv,i) =>
                        inv.imprescindible == true ? (
                          <span
                            className="fw-semibold"
                            key={"impresc" + inv.user_details.idInvitado}
                          >
                            {inv.user_details.name}({inv.user_details.username})
                            {i != store.inviteesDetails.length-1?", ":"."}
                          </span>
                        ) : (
                          <></>
                        )
                      )
                    ) : (
                      <span className="fw-semibold">
                        Evento sin invitados imprescindibles
                      </span>
                    )}
                  </p>
                ) : (
                  <></>
                )}

                <p className="pt-4 fw-semibold">{store.evento.descripcion}</p>
              </div>
              {store.evento.lugar && store.fetchedEvent.mapsQuery == true ? (
                <iframe
                  className="col-sm-6 my-4 px-4"
                  width="400"
                  height="450"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src={`https://www.google.com/maps/embed/v1/search?q=${store.evento.lugar.replace(
                    " ",
                    "+"
                  )}&key=${apiKey}`}
                ></iframe>
              ) : (
                <></>
              )}
            </div>
          </div>
        </div>
        <h2 className="fw-semibold">Resultados de encuesta</h2>
        <Calendar />
        <div className="mb-4">
          <h3>
            {store.currentEventResponses.length > 0 ? (
              store.fechasPosiblesSeparadas.length > 0 ? (
                <span className="fw-semibold">
                  Bloques aprobados de acuerdo a{" "}
                  {store.evento.respondidos.length} usuario
                  {store.evento.respondidos.length > 1 ? "s:" : ":"}
                </span>
              ) : (
                <span className="fw-semibold">
                  No hay bloques posibles con las respuestas ingresadas (
                  {store.evento.respondidos.length} usuario
                  {store.evento.respondidos.length != 1 ? "s" : ""})
                </span>
              )
            ) : (
              <span className="fw-semibold">No hay respuestas aún</span>
            )}
          </h3>
          {store.fechasPosiblesSeparadas != [] &&
            store.fechasPosiblesSeparadas.map((horario, i) => {
              return (
                <h5 className="fw-semibold" key={"horario" + i}>
                  {horario[0]
                    .toLocaleDateString("es", dateOptions)
                    .charAt(0)
                    .toUpperCase() +
                    horario[0].toLocaleDateString("es", dateOptions).slice(1)}
                  : Desde las {horario[1][0]}:00 hasta las {horario[1][1]}:00.
                </h5>
              );
            })}
        </div>
        <hr />
        <div className="my-4" id="editarAsistencia">
          {store.inviteesDetails.some(
            (invitee) => invitee.user_details.idInvitado == currentUser
          ) == false ? (
            <div>
              <h4 className="mb-4 fw-semibold">
                Eres organizador de este evento, pero no participante aún.
              </h4>
              <button
                className="btn btn-primary px-4 fw-semibold"
                onClick={() => actions.createNewInvite(currentUser)}
              >
                Participar del evento
              </button>
            </div>
          ) : (
            <form>
              <h2 className="mb-4 fw-semibold">Tu Respuesta:</h2>
              <div className="my-4">
                <h4 className="fw-semibold">
                  Agregar bloques de disponibilidad:
                </h4>
                <div className="row my-3">
                  <div className="col-sm-4 d-flex my-2">
                    <h5 className="fw-semibold w-25 align-self-center">
                      El día
                    </h5>
                    {store.evento.inicio.toISOString().slice(0, 10) ==
                    store.evento.final.toISOString().slice(0, 10) ? (
                      <input
                        name="fechaNuevoBloque"
                        type="date"
                        className="form-control fw-semibold"
                        value={store.evento.inicio.toISOString().slice(0, 10)}
                        readOnly
                      ></input>
                    ) : (
                      <input
                        name="fechaNuevoBloque"
                        type="date"
                        className="form-control fw-semibold"
                        defaultValue={store.evento.inicio
                          .toISOString()
                          .slice(0, 10)}
                        min={store.evento.inicio.toISOString().slice(0, 10)}
                        max={store.evento.final.toISOString().slice(0, 10)}
                      ></input>
                    )}
                  </div>
                  <div className="d-flex col-sm-3 my-2">
                    <h5 className="align-self-center fw-semibold me-2">
                      desde las
                    </h5>
                    <select
                      name="horaInicioNuevoBloque"
                      className="form-select form-select-sm col fw-semibold"
                    >
                      <option value="0">0:00</option>
                      <option value="1">1:00</option>
                      <option value="2">2:00</option>
                      <option value="3">3:00</option>
                      <option value="4">4:00</option>
                      <option value="5">5:00</option>
                      <option value="6">6:00</option>
                      <option value="7">7:00</option>
                      <option value="8">8:00</option>
                      <option value="9">9:00</option>
                      <option value="10">10:00</option>
                      <option value="11">11:00</option>
                      <option value="12">12:00</option>
                      <option value="13">13:00</option>
                      <option value="14">14:00</option>
                      <option value="15">15:00</option>
                      <option value="16">16:00</option>
                      <option value="17">17:00</option>
                      <option value="18">18:00</option>
                      <option value="19">19:00</option>
                      <option value="20">20:00</option>
                      <option value="21">21:00</option>
                      <option value="22">22:00</option>
                      <option value="23">23:00</option>
                    </select>
                  </div>
                  <div className="col-sm-3 d-flex my-2">
                    <h5 className="col fw-semibold me-2">hasta las</h5>
                    <select
                      name="horaFinalNuevoBloque"
                      className="form-select form-select-sm col fw-semibold"
                    >
                      <option value="1">1:00</option>
                      <option value="2">2:00</option>
                      <option value="3">3:00</option>
                      <option value="4">4:00</option>
                      <option value="5">5:00</option>
                      <option value="6">6:00</option>
                      <option value="7">7:00</option>
                      <option value="8">8:00</option>
                      <option value="9">9:00</option>
                      <option value="10">10:00</option>
                      <option value="11">11:00</option>
                      <option value="12">12:00</option>
                      <option value="13">13:00</option>
                      <option value="14">14:00</option>
                      <option value="15">15:00</option>
                      <option value="16">16:00</option>
                      <option value="17">17:00</option>
                      <option value="18">18:00</option>
                      <option value="19">19:00</option>
                      <option value="20">20:00</option>
                      <option value="21">21:00</option>
                      <option value="22">22:00</option>
                      <option value="23">23:00</option>
                      <option value="24">24:00</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="row justify-content-center">
                <button
                  className="btn btn-primary fw-semibold"
                  onClick={(event) => {
                    event.preventDefault();
                    actions.addNewAvailability(event, navigate);
                  }}
                >
                  Agregar Bloque
                </button>
              </div>
            </form>
          )}
          <div className="my-3">
            {store.bloquesUsuarioActual.length > 0 ? (
              <h4 className="fw-semibold">Tus bloques:</h4>
            ) : (
              <></>
            )}
            {store.bloquesUsuarioActual != [] &&
              store.bloquesUsuarioActual.map((horario, i) => {
                return (
                  <div
                    className="row align-items-baseline"
                    key={"disponibilidad" + i}
                  >
                    <h5 className="fw-semibold col-5">
                      {horario[0]
                        .toLocaleDateString("es", dateOptions)
                        .charAt(0)
                        .toUpperCase() +
                        horario[0]
                          .toLocaleDateString("es", dateOptions)
                          .slice(1)}
                      : {horario[1][0] / 100}:00 - {horario[1][1] / 100}:00
                    </h5>

                    <button
                      className="btn col-1 fs-5 fw-bold text-danger"
                      onClick={() => {
                        actions.deleteAvailability(
                          horario[2],
                          navigate,
                          handleShowToast
                        );
                      }}
                    >
                      X
                    </button>
                    <div className="col-5"></div>
                  </div>
                );
              })}
          </div>
        </div>
        <ToastComponent message={toastMessage} showToast={showToast} />
      </div>
    );
  }
};

export default Evento;
