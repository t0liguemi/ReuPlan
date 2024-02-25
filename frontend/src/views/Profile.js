import React, { useEffect, useState, useContext } from "react";
import { Context } from "../store/context";
import { useNavigate } from "react-router";

const Profile = () => {
  const { store, actions } = useContext(Context);
  const currentUser = localStorage.getItem("reuPlanUserID");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    actions.editUser(e, navigate);
  };

  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    actions.getAuth()
    const fetchData = async () => {
      try {
        setDataLoaded(false);
        await actions.fetchCurrentUser(currentUser);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setDataLoaded(true);
      }
    };

    if (currentUser) {
      fetchData();
    }
    else if (!store.loggedIn){
      navigate("/login")
    }
    return () => {
      actions.resetUserInfo();
      setDataLoaded(false);
    };
  }, [currentUser, dataLoaded]);

  return (
    (store.loggedIn && store.currentUserInfo != undefined) && (
      <div className="container py-3">
        <div>
          <h1 className="fw-semibold">Editar perfil</h1>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(e, navigate);
            }}
          >
            {store.currentUserInfo && (
              <fieldset>
                <div className="row gap-5 my-4">
                  <div className="col">
                    <label className="col fw-semibold">Nombre de usuario</label>
                    <input
                      id="formUsername"
                      className="text form-control my-2"
                      placeholder="nombre de usuario"
                      disabled
                      defaultValue={store.currentUserInfo.username}
                    ></input>
                  </div>
                  <div className="col">
                    <label className="fw-semibold">Contraseña</label>
                    <input
                      id="formPassword"
                      type="password"
                      className="text my-2 form-control"
                      placeholder="contraseña"
                    ></input>
                  </div>
                </div>
                <div className="row gap-5 my-4">
                  <div className="col">
                    <label className="fw-semibold">E-Mail</label>
                    <input
                      className="text my-2 form-control"
                      placeholder="e-mail"
                      disabled
                      defaultValue={store.currentUserInfo.email}
                    ></input>
                  </div>
                  <div className="col">
                    <label className="fw-semibold">Confirmar contraseña</label>
                    <input
                      id="formPassword2"
                      type="password"
                      className="text my-2 form-control"
                      placeholder="contraseña"
                    ></input>
                  </div>
                </div>
                <hr className="my-4"></hr>
                <div className="row gap-5 my-4">
                  <div className="col">
                    <label className="col fw-semibold">Nombre</label>
                    <input
                      id="formName"
                      className="text form-control my-2"
                      placeholder="nombre"
                      defaultValue={store.currentUserInfo.name}
                    ></input>
                  </div>
                  <div className="col">
                    <label className="fw-semibold">Dirección</label>
                    <input
                      className="text my-2 form-control"
                      placeholder="dirección"
                      defaultValue={store.currentUserInfo.address}
                    ></input>
                  </div>
                </div>
                <div className="row gap-5 my-4">
                  <div className="col">
                    <label className="col fw-semibold">
                      Número de teléfono
                    </label>
                    <input
                      id="formName"
                      className="text form-control my-2"
                      placeholder="número de teléfono"
                      defaultValue={store.currentUserInfo.phone}
                    ></input>
                  </div>
                  <div className="col">
                    <label className="col fw-semibold">
                      Tienes un código de ReuPlan+?
                    </label>
                    <input
                      id="formName"
                      className="text form-control my-2"
                      placeholder="tu código"
                      disabled
                    ></input>
                  </div>
                </div>
                {/* <h6 className="fw-semibold">*Cambios en estos datos requerirán que vuelvas a ingresar</h6> */}
                <button
                  className="btn btn-primary px-5 my-2 fw-semibold fs-5"
                  type="submit"
                >
                  {/* actions.createUser(e,navigate)}> */}
                  Guardar Cambios
                </button>
              </fieldset>
            )}
          </form>
        </div>
      </div>
    )
  );
};

export default Profile;
