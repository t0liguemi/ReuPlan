import { Link, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { ReactComponent as Logo } from "../resources/logo.svg";
import "./navbarStyle.css";
import { CgProfile } from "react-icons/cg";
import { Context } from "../store/context";

function LoggedInNavbar() {
  const username = localStorage.getItem("reuPlanUser")
  const navigate = useNavigate();
  const { store, actions } = useContext(Context);
  useEffect(()=>{
    actions.userInvitesAndResponses()
    if (store.pending>0){
    actions.triggerGeneralToast("Tienes invitaciones pendientes","primary")}
  },[])

  useEffect(() => {
  }, [store.pending]);
  
  return (
      <nav
        className="sticky-top navbar navbar-expand-md border"
        id="navbar-yessir"
        aria-label="Fourth navbar example"
      >
        <div className="container-fluid">
          <Link className="navbar-brand fw-bold d-inline" to="/">
            <Logo width={30} height={35} fill="#f18805" />{" "}
            <span className="text-primary fw-bold">Reu</span>
            <span className="fw-bold text-success">plan</span>
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarsExample04"
            aria-controls="navbarsExample04"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse  " id="navbarsExample04">
            <ul className="navbar-nav  me-auto mb-2 mb-md-0 ">
              <li className="nav-item " key="2">
                <Link
                  className="nav-link fw-semibold"
                  aria-current="page"
                  to="/eventList"
                >
                  <span className={store.pending>0?"pending":""}>Mis Reuniones ({store.pending})</span>
                </Link>
              </li>
              <li className="nav-item " key="1">
                <Link className="nav-link fw-semibold" to="/create">
                  Crear Evento
                </Link>
              </li>
            </ul>
            <div className="dropdown">
              <button
                className="btn btn-primary dropdown-toggle fw-semibold fs-5"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {username+" "}
                <CgProfile/>
              </button>
              <ul className="dropdown-menu">
                <li key="4">
                  <Link to="/profile" className="dropdown-item fw-semibold" type="button">
                    Mi cuenta
                  </Link>
                </li>
                <li key="6" onClick={() => actions.logout(navigate)}>
                  <Link
                    className="dropdown-item fw-semibold"
                    type="button"
                    
                  >
                    Cerrar Sesión
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>
  );
}

export default LoggedInNavbar;
