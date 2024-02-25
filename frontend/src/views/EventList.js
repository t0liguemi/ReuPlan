import "./EventList.css";
import React, { useContext, useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Context } from "../store/context";

const EventList = () => {
  const { store, actions } = useContext(Context);
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);
  const [eventos, setEventos] = useState([]);
  const [usuarioLogueadoId, setUsuarioLogueadoId] = useState(null);
  const [eventosAceptados, setEventosAceptados] = useState([]);
  const [eventosRechazados, setEventosRechazados] = useState([]);
  const [eventosPendientesFiltrados, setEventosPendientesFiltrados] = useState(
    []
  );
  const [eventosOrganizadosPorMi, setEventosOrganizadosPorMi] = useState([]);

  const getAuth = () => {
    const storedUserId = localStorage.getItem("reuPlanUserID");

    if (!storedUserId) {
      console.error("ID del usuario no encontrado en el almacenamiento local");
      return;
    }

    setUsuarioLogueadoId(storedUserId);
  };

  const fetchData = async () => {
    try {
      const [eventsResponse, participationResponse] = await Promise.all([
        fetch("http://localhost:5000/events", {
          method: "GET",
          headers: {
            "Content-type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("reuPlanToken"),
          },
        }),
        fetch("http://localhost:5000/user_participation", {
          method: "PUT",
          headers: {
            "Content-type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("reuPlanToken"),
          },
          body: JSON.stringify({ idInvitado: usuarioLogueadoId }),
        }),
      ]);

      if (eventsResponse.ok && participationResponse.ok) {
        const [eventsData, participationData] = await Promise.all([
          eventsResponse.json(),
          participationResponse.json(),
        ]);

        setEventos(eventsData.data);

        const { invitaciones, respuestas, rechazos, eventosInv } =
          participationData;
        const eventosAceptadosActualizados = eventos.filter((evento) =>
          respuestas.some(
            (respuesta) => String(respuesta.idEvento) === String(evento.id)
          )
        );

        const eventosRechazadosActualizados = eventos.filter((evento) =>
          rechazos.some(
            (rechazo) => String(rechazo.idEvento) === String(evento.id)
          )
        );

        const eventosOrganizadosPorMi = eventos.filter(
          (evento) => String(evento.idOrganizador) === String(usuarioLogueadoId)
        );
        setEventosOrganizadosPorMi(eventosOrganizadosPorMi);

        setEventosAceptados(eventosAceptadosActualizados);
        setEventosRechazados(eventosRechazadosActualizados);
        const eventosPendientes = eventos.filter(
          (evento) =>
            !respuestas.some(
              (respuesta) => String(respuesta.idEvento) === String(evento.id)
            ) &&
            !rechazos.some(
              (rechazo) => String(rechazo.idEvento) === String(evento.id)
            ) &&
            String(evento.idOrganizador) !== String(usuarioLogueadoId)
        );
        const eventosInvitados = eventosInv.filter(
          (inv) =>
            !respuestas.some((resp) => resp.idEvento == inv.idEvento) &&
            !rechazos.some((rej) => rej.idEvento == inv.idEvento)
        );
        setEventosPendientesFiltrados(eventosInvitados);
        if (loaded == false) {
          setLoaded(true);
        }
      } else {
      }
    } catch (error) {
      console.error("Error en la solicitud:", error.message);
    }
  };

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
          actions.triggerGeneralToast("Inicia sesión para continuar", "danger");
          store.loggedIn = false;
        }
        if (resp.status == 200) {
          getAuth();
          fetchData();
        }
      })
      .then((data) => {})
      .catch((error) => {});
  }, [store.currentUser, usuarioLogueadoId, loaded]);
  if (loaded) {
    return (
      <div className="container py-4">
        <div className="d-flex justify-content-between">
          <h1 className="events-title fw-semibold">Mis Reuniones</h1>
          <Link style={{ zIndex: "3" }} to="/create">
            <button className="px-4 btn btn-success fs-5 py-2 fw-semibold">
              Nuevo Evento
            </button>
          </Link>
        </div>

        <div
          className="sticky-top"
          style={{ paddingTop: "38px", marginTop: "-38px", zIndex: "2" }}
        >
          <div className="row my-4 bg-primary py-2">
            <div className="col-4">
              <h5 className="fw-semibold text-white text-center">
                Nombre del evento
              </h5>
            </div>
            <div className="col-4">
              <h5 className="text-center fw-semibold text-white">Fecha</h5>
            </div>
            <div className="col-4">
              <h5 className="fw-semibold text-white text-center">Lugar</h5>
            </div>
          </div>
        </div>

        {/* Sección de eventos organizados por el usuario */}
        <div className="fw-semibold">
          <div className="mb-3">
            <h3 className="pt-4 fw-semibold">Organizados por mí:</h3>
            <small className="text-secondary fw-semibold py-0 my-0">
              Eventos que tu creaste en la aplicación.
            </small>
          </div>
          {eventosOrganizadosPorMi.map((evento) => (
            <Link
              to={`/evento/${evento.id}`}
              style={{ textDecoration: "none" }}
              key={"org" + evento.id}
              className="evento-lista row my-4 mx-0 text-break"
            >
              <h5 className="col-4 fw-semibold fs-5 text-center">
                {evento.name}
              </h5>
              <p className="col-4 m-0 fw-semibold fs-6 text-center">{`${evento.inicio}  al  ${evento.final}`}</p>
              <p className="col-4 p-0 m-0 fw-semibold fs-6  text-center">
                {evento.lugar}
              </p>
            </Link>
          ))}
        </div>

        {/* Sección de eventos pendientes */}
        <div className="fw-semibold">
          <div className="mb-3">
            <h3 className="pt-4 mb-0 pb-0 fw-semibold">Pendientes</h3>
            <small className="text-secondary fw-semibold py-0 my-0">
              Eventos, de los cuales eres participante, a los que aún no has
              respondido.
            </small>
          </div>
          {eventosPendientesFiltrados.map((evento) => (
            <Link
              to={`/evento/${evento.idEvento}`}
              style={{ textDecoration: "none" }}
              key={"pending" + evento.idEvento}
              className="evento-lista row my-4 mx-0 text-break"
            >
              <h5 className="col-4 fw-semibold fs-5 text-center">
                {evento.name}
              </h5>
              <p className="col-4 m-0 fw-semibold fs-6 text-center">{`${evento.inicio} al ${evento.final}`}</p>
              <p className="col-4 p-0 m-0 tex-center fw-semibold fs-6 text-center">
                {evento.lugar}
              </p>
            </Link>
          ))}
        </div>

        {/* Sección de eventos aceptados */}
        <div className="fw-semibold">
          <div className="mb-3">
            <h3 className="pt-4 mb-0 pb-0 fw-semibold">Aceptados</h3>
            <small className="text-secondary fw-semibold py-0 my-0">
              Eventos, de los cuales eres participante, a los que has ingresado
              disponibilidades.
            </small>
          </div>
          {eventosAceptados.map((evento) => (
            <Link
              to={`/evento/${evento.id}`}
              style={{ textDecoration: "none" }}
              key={"accept" + evento.id}
              className="evento-lista row my-4 text-body text-break"
            >
              <h5 className="col-4 fw-semibold fs-5 text-center">
                {evento.name}
              </h5>
              <p className="col-4 m-0 fw-semibold fs-6 text-center">{`${evento.inicio} al ${evento.final}`}</p>
              <p className="col-4 p-0 m-0 tex-center fw-semibold fs-6 text-center">
                {evento.lugar}
              </p>
            </Link>
          ))}
        </div>
        {/* Sección de eventos rechazados */}
        <div className="fw-semibold">
          <div className="mb-3">
            <h3 className="pt-4 mb-0 pb-0 fw-semibold">Rechazados</h3>
            <small className="text-secondary fw-semibold py-0 my-0">
              Eventos, para los cuales recibiste una invitación, que has
              rechazado.
            </small>
          </div>
          {eventosRechazados.map((evento) => (
            <Link
              key={"rej" + evento.id}
              to={`/evento/${evento.id}`}
              style={{ textDecoration: "none" }}
              className="evento-lista text-body row my-4"
            >
              <h5 className="col-4 fw-semibold fs-5 text-center">
                {evento.name}
              </h5>
              <p className="col-4 m-0 fw-semibold fs-6 text-center">{`${evento.inicio} al ${evento.final}`}</p>
              <p className="col-4 p-0 m-0 tex-center fw-semibold fs-6 text-center">
                {evento.lugar}
              </p>
            </Link>
          ))}
        </div>
      </div>
    );
  } else {
    <div className="d-flex justify-content-center align-content-center my-5 py-5">
      <div className="spinner-border" role="status"></div>
      <h5 className="text-secondary">Cargando</h5>
    </div>;
  }
};
export default EventList;
