const getState = ({ getStore, getActions, setStore }) => {
  return {
    store: {
      pending: 0,
      generalToast: { state: false, message: "", type: "primary" },
      updatedList: 0,
      currentEventResponses: [],
      currentEventViability: true,
      eventReady: false,
      fetchedEvent: {},
      currentEventsRejections: [],
      yaInvitado: false,
      inviteesDetails: [],
      currentEventsInvitees: [],
      loggedIn: false,
      bloquesUsuarioActual: [],
      fechasPosiblesSeparadas: [],
      horarios: [],
      currentUserInfo: {},
      evento: {
        idEvento: null,
        nombre: null,
        lugar: null,
        inicio: null, //parse para el backend
        final: null, //parse para el backend
        duracion: null, //aun no del todo definitivo
        organizador: null, //id
        invitados: [], //ids
        imprescindibles: [],
        rechazados: [],
        respondidos: [], //los nombres los pone acá el front end para dibujarlos
        respuestas: [],
        descripcion: null,
        privacidad: [true, true, true, true],
        requisitos: [true, false, false, false],
      },
    },
    actions: {
      findPending: () => {
        const store = getStore();
        let pending = store.currentUsersInvitations.length;
        for (let invitacion of store.currentUsersInvitations) {
          if (
            store.currentUsersResponses.some(
              (respuesta) => respuesta.idEvento == invitacion.idEvento
            ) ||
            store.currentUsersRejections.some(
              (respuesta) => respuesta.idEvento == invitacion.idEvento
            )
          ) {
            pending -= 1;
          }
        }
        setStore({ pending });
      },
      userInvitesAndResponses: () => {
        const actions = getActions();
        fetch("http://localhost:5000/inv_resp_rej", {
          method: "POST",
          headers: {
            "Content-type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("reuPlanToken"),
          },
          body: JSON.stringify({
            userID: localStorage.getItem("reuPlanUserID"),
          }),
        })
          .then((resp) => {
            if (resp.status == 200) {
              return resp.json();
            }
          })
          .then((data) => {
            const currentUsersInvitations = data.invitaciones;
            const currentUsersResponses = data.respuestas;
            const currentUsersRejections = data.rechazos;
            setStore({
              currentUsersInvitations,
              currentUsersResponses,
              currentUsersRejections,
            });
            actions.findPending();
          })
          .catch((error) => {});
      },
      editUser: (e, navigate) => {
        e.preventDefault();
        const actions = getActions();
        let answers = {
          userID: parseFloat(localStorage.getItem("reuPlanUserID")),
          password: e.target[2].value,
          name: e.target[5].value,
          address: e.target[6].value,
          phone: e.target[7].value,
        };
        if (answers.password == "") {
          delete answers.password;
        }
        fetch("http://localhost:5000/edit_profile", {
          method: "PUT",
          headers: {
            "Content-type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("reuPlanToken"),
          },
          body: JSON.stringify(answers),
        })
          .then((resp) => {
            if (resp.status == 201) {
              actions.triggerGeneralToast(
                "Datos de cuenta actualizados",
                "primary"
              );
              return resp.json();
            }
          })
          .then((data) => {})
          .catch((error) => {});
      },
      fetchCurrentUser: (id) => {
        fetch("http://localhost:5000/user_details", {
          method: "POST",
          headers: {
            "Content-type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("reuPlanToken"),
          },
          body: JSON.stringify({
            userID: id,
          }),
        })
          .then((resp) => {
            if (resp.status == 200) {
              return resp.json();
            }
          })
          .then((data) => {
            const currentUserInfo = data.data;
            setStore({ currentUserInfo });
          })
          .catch((error) => {});
      },
      resetUserInfo: () => {
        setStore({ currentUserInfo: undefined });
      },
      editEvent: (e, id) => {
        const actions = getActions();
        fetch("http://localhost:5000/edit_event", {
          method: "PUT",
          headers: {
            "Content-type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("reuPlanToken"),
          },
          body: JSON.stringify({
            idEvento: id,
            name: e.target[1].value,
            inicio: e.target[2].value,
            final: e.target[3].value,
            duracion: parseInt(e.target[4].value),
            lugar: e.target[5].value,
            mapsQuery: e.target[6].checked,
            descripcion: e.target[7].value,
            privacidad1: e.target[8].checked,
            privacidad2: e.target[9].checked,
            privacidad3: e.target[10].checked,
            privacidad4: e.target[11].checked,
            requisitos1: e.target[12].checked,
            requisitos2: e.target[13].checked,
            requisitos3: e.target[14].checked,
            requisitos4: e.target[15].checked,
          }),
        })
          .then((resp) => {
            if (resp.status == 201) {
              actions.triggerGeneralToast("Evento editado", "primary");
              return resp.json();
            }
          })
          .then((data) => {})
          .catch((error) => {});
      },
      triggerGeneralToast: (message, type) => {
        const actions = getActions();
        const { generalToast } = getStore();
        generalToast.state = false;
        setStore({ generalToast });
        generalToast.state = true;
        generalToast.message = message;
        generalToast.type = type;
        setStore({ generalToast });
        setTimeout(() => {
          generalToast.state = false;
          setStore({ generalToast });
        }, 5000);
      },
      mainEventView: (eventID, navigate) => {
        const actions = getActions();
        let {
          fetchedEvent,
          currentEventsInvitees,
          currentEventsRejections,
          currentEventResponses,
        } = getStore();
        const fetchSetup = {
          method: "POST",
          headers: {
            "Content-type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("reuPlanToken"),
          },
          body: JSON.stringify({
            idEvento: eventID,
          }),
        };
        function findEvent() {
          return fetch("http://localhost:5000/event", {
            method: "POST",
            headers: {
              "Content-type": "application/json",
              Authorization: "Bearer " + localStorage.getItem("reuPlanToken"), //ENCONTRAR EVENTO ACA
            },
            body: JSON.stringify({
              eventID: eventID,
            }),
          }).then((resp) => {
            if (resp.status == 200) {
              return resp.json();
            } else navigate("/eventList");
          });
        }
        function findInvitees() {
          return fetch("http://localhost:5000/invitees", fetchSetup).then(
            (resp) => {
              if (resp.status == 200) {
                return resp.json();
              } else navigate("/login");
            }
          );
        }
        function findRejects() {
          return fetch("http://localhost:5000/rejections", fetchSetup).then(
            (resp) => {
              if (resp.status == 200) {
                return resp.json();
              } else navigate("/login");
            }
          );
        }
        function findSchedules() {
          return fetch("http://localhost:5000/schedules", fetchSetup).then(
            (resp) => {
              if (resp.status == 200) {
                return resp.json();
              } else navigate("/login");
            }
          );
        }
        function findEventData() {
          return Promise.all([
            findEvent(),
            findInvitees(),
            findRejects(),
            findSchedules(),
          ]).then(([evento, invitados, rechazos, respuestas]) => {
            fetchedEvent = evento.data;
            currentEventsInvitees = invitados.data;
            currentEventsRejections = rechazos.data;
            currentEventResponses = respuestas.data;
            setStore({
              fetchedEvent,
              currentEventsInvitees,
              currentEventsRejections,
              currentEventResponses,
            });
          });
        }
        findEventData()
          .then(() => {
            actions.rebuildEventFromAPI(navigate);
          })
          .catch((error) => {});
      },
      rebuildEventFromAPI: (navigate) => {
        const currentUser = localStorage.getItem("reuPlanUserID");
        const actions = getActions();
        const store = getStore();
        store.evento.rechazados = [];
        store.evento.inicio = new Date(
          store.fetchedEvent.inicio + "T03:00:00.000Z"
        );
        store.evento.final = new Date(
          store.fetchedEvent.final + "T03:00:00.000Z"
        );
        store.evento.idEvento = store.fetchedEvent.id;
        store.evento.lugar = store.fetchedEvent.lugar;
        store.evento.duracion = store.fetchedEvent.duracion;
        store.evento.nombre = store.fetchedEvent.name;
        store.evento.organizador = store.fetchedEvent.idOrganizador;
        store.evento.descripcion = store.fetchedEvent.descripcion;
        store.currentEventsInvitees.forEach((invitado) => {
          if (
            !store.evento.invitados.some(
              (usuario) => usuario == invitado.idInvitado
            )
          ) {
            store.evento.invitados.push(invitado.idInvitado);
          }
        });
        store.currentEventsInvitees.forEach((invitado) => {
          if (invitado.imprescindible == true) {
            store.evento.imprescindibles.push(invitado.idInvitado);
          }
          store.currentEventsRejections.forEach((invitado) => {
            store.evento.rechazados.push(invitado.id);
          });
        });
        store.evento.privacidad[0] = store.fetchedEvent.privacidad1;
        store.evento.privacidad[1] = store.fetchedEvent.privacidad2;
        store.evento.privacidad[2] = store.fetchedEvent.privacidad3;
        store.evento.privacidad[3] = store.fetchedEvent.privacidad4;
        store.evento.requisitos[0] = store.fetchedEvent.requisitos1;
        store.evento.requisitos[1] = store.fetchedEvent.requisitos2;
        store.evento.requisitos[2] = store.fetchedEvent.requisitos3;
        store.evento.requisitos[3] = store.fetchedEvent.requisitos4;

        const fechas = [];
        const contadorDias = new Date(store.fetchedEvent.inicio);
        const totalDays = //cantidad de dias en que puede hacerse el evento
          (store.evento.final.getTime() - store.evento.inicio.getTime()) /
          (1000 * 3600 * 24);

        for (let i = 0; i <= totalDays; i++) {
          //agrega a fechas las posibles fechas en formato yyyy-mm-dd
          fechas.push(contadorDias.toISOString().slice(0, 10));
          contadorDias.setDate(contadorDias.getDate() + 1);
        }

        let availableDays = []; //generar de las fechas las tuplas [yxxxx,mxx,dxx] para generar cada dia
        fechas.forEach((fecha) => {
          availableDays.push([
            "y" + fecha.slice(0, 4),
            "m" + fecha.slice(5, 7),
            "d" + fecha.slice(8, 10),
          ]);
        });
        let answerIndex;

        for (let invitado of store.currentEventsInvitees) {
          if (
            !store.evento.respuestas.some(
              (respuesta) => respuesta.userID == invitado.idInvitado
            )
          ) {
            store.evento.respuestas.push({ userID: invitado.idInvitado });
          }
          answerIndex = store.evento.respuestas.findIndex(
            (elemento) => elemento.userID == invitado.idInvitado
          );
        }
        for (let [y, m, d] of availableDays) {
          store.evento.respuestas.forEach((respuesta) => {
            respuesta[y] = respuesta[y] || {};
            respuesta[y][m] = respuesta[y][m] || {};
            respuesta[y][m][d] = [];
          });
        }

        for (let respuesta of store.currentEventResponses) {
          const h = [respuesta.inicio, respuesta.final];
          const [y, m, d] = [
            "y" + respuesta.fecha.slice(0, 4),
            "m" + respuesta.fecha.slice(5, 7),
            "d" + respuesta.fecha.slice(8, 10),
          ];
          for (let horario of store.evento.respuestas) {
            if (horario.userID == respuesta.idInvitado) {
              if (horario[y][m][d] != undefined) {
                horario[y][m][d].push(h);
              }
            }
          }
        }

        setStore(store);
        if (
          store.currentEventsInvitees.some(
            (inv) => inv.idInvitado == currentUser
          ) == false &&
          store.fetchedEvent.idOrganizador != currentUser
        ) {
          actions.triggerGeneralToast(
            "No tienes acceso a ese evento",
            "danger"
          );
          navigate("/eventList");
        }
        actions.checkEachInviteesResponses();
        actions.meetingResultsToDate();
        actions.userBlocksToDate(localStorage.getItem("reuPlanUserID"));
        actions.getHostData();
        actions.calculateViability();
        actions.userInvitesAndResponses();
        actions.findInviteesDetails(
          localStorage.getItem("reuPlanUserCurrentEvent")
        );

        store.eventReady = true;
      },
      queryUser: (searchValue, setUsuarioExiste) => {
        const store = getStore();
        const actions = getActions();
        fetch("http://localhost:5000/user", {
          method: "POST",
          headers: {
            "Content-type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("reuPlanToken"),
          },
          body: JSON.stringify({ search_query: searchValue }),
        })
          .then((resp) => {
            if (resp.status == 200) {
              return resp.json();
            } else if (resp.status == 404) {
              if (setUsuarioExiste != undefined) {
                setUsuarioExiste(false);
                const yaInvitado = false;
                setStore({ yaInvitado });
              }
            }
          })
          .then((data) => {
            if (data != undefined && setUsuarioExiste != undefined) {
              setUsuarioExiste(true);
              actions.createNewInvite(data.data.id);
              actions.userInvitesAndResponses();
            }
          })
          .catch((error) => {});
      },
      findInviteesDetails: () => {
        let { inviteesDetails } = getStore();
        fetch("http://localhost:5000/invitee_details", {
          method: "POST",
          headers: {
            "Content-type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("reuPlanToken"),
          },
          body: JSON.stringify({
            idEvento: localStorage.getItem("reuPlanCurrentEvent"),
          }),
        })
          .then((resp) => {
            if (resp.status == 200) {
              return resp.json();
            }
          })
          .then((data) => {
            inviteesDetails = data.data;
            setStore({ inviteesDetails });
          })
          .catch((error) => {});
      },
      calculateViability: () => {
        const store = getStore();
        if (
          store.currentEventsInvitees.some(
            (inv) =>
              inv.imprescindible == true &&
              store.currentEventsRejections.some(
                (rej) => inv.idInvitado == rej.idInvitado
              )
          )
        ) {
          const currentEventViability = false;
          setStore({ currentEventViability });
        } else {
          const currentEventViability = true;
          setStore({ currentEventViability });
        }
      },
      emptyInviteesDetails: () => {
        const inviteesDetails = [];
        setStore(inviteesDetails);
      },
      getHostData: () => {
        fetch("http://localhost:5000/event_org_data", {
          method: "POST",
          headers: {
            "Content-type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("reuPlanToken"),
          },
          body: JSON.stringify({
            eventID: localStorage.getItem("reuPlanCurrentEvent"),
          }),
        })
          .then((resp) => {
            if (resp.status == 200) {
              return resp.json();
            }
          })
          .then((data) => {
            const hostData = data.data;
            setStore({ hostData });
          })
          .catch((error) => {});
      },
      findEventRejections: (idEvento) => {
        let { currentEventsRejections } = getStore();
        fetch("http://localhost:5000/rejections", {
          method: "POST",
          headers: {
            "Content-type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("reuPlanToken"),
          },
          body: JSON.stringify({
            idEvento: idEvento,
          }),
        })
          .then((resp) => {
            if (resp.status == 200) {
              return resp.json();
            }
          })
          .then((data) => {
            currentEventsRejections = data.data;
            setStore({ currentEventsRejections });
          })
          .catch((error) => {});
      },
      rejectInvite: (navigate) => {
        const actions = getActions();
        fetch("http://localhost:5000/reject", {
          method: "POST",
          headers: {
            "Content-type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("reuPlanToken"),
          },
          body: JSON.stringify({
            inviteeID: localStorage.getItem("reuPlanUserID"),
            eventID: localStorage.getItem("reuPlanCurrentEvent"),
          }),
        })
          .then((resp) => {
            if (resp.status == 201) {
              actions.getAuth();
              actions.mainEventView(
                localStorage.getItem("reuPlanCurrentEvent"),
                navigate
              );
              actions.userInvitesAndResponses();
              actions.triggerGeneralToast("Evento rechazado", "primary");
              return resp.json();
            }
          })
          .then((data) => {})
          .catch((error) => {});
      },
      createNewInvite: (inviteeID) => {
        const actions = getActions();
        fetch("http://localhost:5000/add_invitee", {
          method: "POST",
          headers: {
            "Content-type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("reuPlanToken"),
          },
          body: JSON.stringify({
            idInvitado: inviteeID,
            target_event: localStorage.getItem("reuPlanCurrentEvent"),
            imprescindible: false,
          }),
        })
          .then((resp) => {
            if (resp.status == 201) {
              actions.triggerGeneralToast("Invitado agregado", "primary");
              actions.findInviteesDetails();
              const yaInvitado = false;
              setStore({ yaInvitado });
              return resp.json();
            }
            if (resp.status == 409) {
              actions.findInviteesDetails(
                localStorage.getItem("reuPlanCurrentEvent")
              );
              actions.userInvitesAndResponses();
              const yaInvitado = true;
              setStore({ yaInvitado });
            }
          })
          .then((data) => {})
          .catch((error) => {});
      },
      toggleImprescindible: (inviteID) => {
        const actions = getActions();
        fetch("http://localhost:5000/toggle_imprescindible", {
          method: "PUT",
          headers: {
            "Content-type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("reuPlanToken"),
          },
          body: JSON.stringify({
            invitation_id: inviteID,
          }),
        })
          .then((resp) => {
            if (resp.status == 200) {
              actions.triggerGeneralToast(
                "Tipo de invitado cambiado",
                "primary"
              );
              actions.findInviteesDetails();

              return resp.json();
            } else {
              actions.getAuth();
            }
          })
          .then((data) => {})
          .catch((error) => {});
      },
      deleteEvent: (id, navigate) => {
        const actions = getActions();
        fetch("http://localhost:5000/delete_event", {
          method: "DELETE",
          headers: {
            "Content-type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("reuPlanToken"),
          },
          body: JSON.stringify({
            idEvento: id,
          }),
        })
          .then((resp) => {
            if (resp.status == 200) {
              navigate("/eventList");
              actions.triggerGeneralToast("Evento eliminado", "primary");
              actions.findInviteesDetails();
              actions.userInvitesAndResponses();
              return resp.json();
            }
          })
          .then((data) => {})
          .catch((error) => {});
      },
      uninviteUser: (id) => {
        const actions = getActions();
        fetch("http://localhost:5000/delete_invitee", {
          method: "DELETE",
          headers: {
            "Content-type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("reuPlanToken"), //ENCONTRAR EVENTO ACA
          },
          body: JSON.stringify({
            invitation_id: id,
          }),
        })
          .then((resp) => {
            if (resp.status == 200) {
              actions.findInviteesDetails();
              actions.userInvitesAndResponses();
              return resp.json();
            }
          })
          .then((data) => {})
          .catch((error) => {});
      },
      getEvent: (eventID) => {
        const actions = getActions();
        let result = {};
        let { fetchedEvent } = getStore();
        fetch("http://localhost:5000/event", {
          method: "POST",
          headers: {
            "Content-type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("reuPlanToken"), //ENCONTRAR EVENTO ACA
          },
          body: JSON.stringify({
            eventID: eventID,
          }),
        })
          .then((resp) => {
            if (resp.status == 200) {
              return resp.json();
            }
          })
          .then((data) => {
            fetchedEvent = data.data;
            setStore({ fetchedEvent });
          })
          .catch((error) => {});
      },
      getAllEvents: () => {
        const store = getStore();
        fetch("http://localhost:5000/events", {
          method: "GET",
          headers: {
            "Content-type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("reuPlanToken"),
          },
        })
          .then((resp) => {
            if (resp.status == 200) {
              return resp.json();
            }
          })
          .then((data) => {
            store.events = data;
            setStore(store);
          })
          .catch((error) => {});
      },
      createEvent: (e, navigate, createdEvent) => {
        const actions = getActions();
        const nullified = {};
        const answers = {
          name: e.target[1].value,
          inicio: e.target[2].value,
          final: e.target[3].value,
          duracion: parseInt(e.target[4].value),
          lugar: e.target[5].value,
          mapsQuery: e.target[6].checked,
          descripcion: e.target[7].value,
          privacidad1: e.target[8].checked,
          privacidad2: e.target[9].checked,
          privacidad3: e.target[10].checked,
          privacidad4: e.target[11].checked,
          requisitos1: e.target[12].checked,
          requisitos2: e.target[13].checked,
          requisitos3: e.target[14].checked,
          requisitos4: e.target[15].checked,
          idOrganizador: parseInt(localStorage.getItem("reuPlanUserID")),
          respondidos: 0,
        };
        if (answers.final < answers.inicio) {
          alert("El final del evento debe ser posterior a su inicio");
          return {};
        }
        for (let answer in answers) {
          if (answers[answer] === "") {
            nullified[answer] = null;
          } else {
            nullified[answer] = answers[answer];
          }
        }

        fetch("http://localhost:5000/create_event", {
          method: "POST",
          headers: {
            "Content-type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("reuPlanToken"),
          },

          body: JSON.stringify(nullified),
        })
          .then((resp) => {
            if (resp.status == 400) {
              alert(resp.msg);
            }
            if (resp.status == 201) {
              createdEvent(true);
              navigate("/create#invitadosList");

              return resp.json();
            }
          })
          .then((data) => {
            localStorage.setItem("reuPlanCurrentEvent", data.id);
            actions.findInviteesDetails();
          })

          .catch((error) => {});
      },
      logout: (navigate) => {
        navigate("/");
        const actions = getActions();
        const store = getStore();
        actions.triggerGeneralToast("Haz cerrado sesión", "secondary");
        localStorage.removeItem("reuPlanUser");
        localStorage.removeItem("reuPlanToken");
        localStorage.removeItem("reuPlan.UserID");
        store.loggedIn = false;
        setStore(store);
      },
      getAuth: () => {
        const actions = getActions();
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
              const store = getStore();
              store.loggedIn = false;
              setStore(store);
            }
            if (resp.status == 200) {
              const store = getStore();
              actions.userInvitesAndResponses();
              store.loggedIn = true;
              setStore(store);
            }
          })
          .then((data) => {})
          .catch((error) => {});
      },
      createUser: (e, navigate) => {
        const actions = getActions();
        e.preventDefault();
        if (e.target[1].value.length < 8) {
          alert(
            "El usuario debe tener un mínimo de 8 caracteres, sólo letras y números."
          );
        } else if (e.target[1].value.includes(" ")) {
          alert(
            "El nombre de usuario no puede contener espacios o caracteres especiales"
          );
        } else if (e.target[2].value != e.target[4].value) {
          alert("Las contraseñas no coincidien.");
        } else {
          fetch("http://localhost:5000/register", {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({
              username: e.target[1].value,
              password: e.target[2].value,
              name: e.target[5].value,
              address: e.target[6].value,
              phoneNumber: e.target[7].value,
              email: e.target[3].value,
              premium: true,
            }),
          })
            .then((resp) => {
              if (resp.status == 400) {
                alert(resp.msg);
              }
              if (resp.status == 201) {
                actions.triggerGeneralToast(
                  "Cuenta creada satisfactoriamente!",
                  "primary"
                );
                navigate("/login");
                return resp.json();
              }
            })
            .then((data) => {})
            .catch((error) => {});
        }
      },
      loginAttempt: (e, navigate) => {
        const actions = getActions();
        e.preventDefault();
        fetch("http://localhost:5000/login", {
          method: "POST",
          headers: { "Content-type": "application/json" },
          body: JSON.stringify({
            username: e.target.form[0].value,
            password: e.target.form[1].value,
          }),
        })
          .then((resp) => {
            if (resp.status == 404 || resp.status == 401) {
              actions.triggerGeneralToast("Credenciales incorrectas", "danger");
            }
            if (resp.status == 200) {
              actions.triggerGeneralToast("Bienvenido de vuelta!", "primary");
              return resp.json();
            }
          })
          .then((data) => {
            if (data != undefined) {
              const store = getStore();
              localStorage.setItem("reuPlanUser", data.username);
              localStorage.setItem("reuPlanUserID", data.user_id);
              localStorage.setItem("reuPlanToken", data.token);
              actions.getAuth();
              store.loggedIn = false;
              setStore(store);
              navigate("/");
            }
          })
          .catch((error) => {
            if (error.status == 404) {
            }
          });
      },
      checkEachInviteesResponses: () => {
        //revisa la respuesta de cada invitado para cada dia posible del evento => evento.respondidos
        //edita la propiedad "respondidos" del evento de acuerdo a lo mencionado arriba
        // ES PARA UN EVENTO
        const store = getStore();
        const fechas = [];
        const contadorDias = new Date(store.evento.inicio);
        let totalDays;
        if (store.evento.final) {
          totalDays = //cantidad de dias en que puede hacerse el evento
            (store.evento.final.getTime() - store.evento.inicio.getTime()) /
            (1000 * 3600 * 24);
        }

        for (let i = 0; i <= totalDays; i++) {
          //agrega a fechas las posibles fechas en formato yyyy-mm-dd
          fechas.push(contadorDias.toISOString().slice(0, 10));
          contadorDias.setDate(contadorDias.getDate() + 1);
        }

        let availableDays = []; //generar de las fechas las tuplas [yxxxx,mxx,dxx] para generar cada dia
        fechas.forEach((fecha) => {
          availableDays.push([
            "y" + fecha.slice(0, 4),
            "m" + fecha.slice(5, 7),
            "d" + fecha.slice(8, 10),
          ]);
        });
        const checkedUser = [];
        store.evento.respuestas.forEach((respuesta, i) => {
          for (let [y, m, d] of availableDays) {
            if (respuesta[y][m][d] != "") {
              checkedUser.push(respuesta.userID);
              break;
            }
          }
        });
        store.evento.respondidos = checkedUser;
        setStore(store);
      },
      addNewAvailability: (e, navigate) => {
        const actions = getActions();
        if (e.target.form[0].value == "") {
          alert("Elige una fecha!");
          return;
        }
        const idEvento = localStorage.getItem("reuPlanCurrentEvent");
        const newYear = e.target.form[0].value.slice(0, 4);
        const newMonth = e.target.form[0].value.slice(5, 7);
        const newDay = e.target.form[0].value.slice(8, 10);
        const newStart = e.target.form[1].value;
        const newEnd = e.target.form[2].value;
        const userID = localStorage.getItem("reuPlanUserID");

        if (newEnd - newStart <= 0) {
          alert("La hora de final debe ser posterior a la de inicio!");
        } else {
          fetch("http://localhost:5000/schedule_entry", {
            method: "POST",
            headers: {
              "Content-type": "application/json",
              Authorization: "Bearer " + localStorage.getItem("reuPlanToken"),
            },
            body: JSON.stringify({
              idEvento: idEvento,
              idInvitado: userID,
              fecha: `${newYear}-${newMonth}-${newDay}`,
              inicio: newStart * 100,
              final: newEnd * 100,
            }),
          })
            .then((resp) => {
              if (resp.status == 201) {
                actions.getAuth();
                actions.triggerGeneralToast("Horario agregado", "primary");
                actions.mainEventView(
                  localStorage.getItem("reuPlanCurrentEvent")
                );

                return resp.json();
              }
            })
            .then((data) => {
              if (data != undefined) {
              }
            })
            .catch((error) => {});
        }
      },
      deleteAvailability: (id, navigate) => {
        const actions = getActions();
        fetch("http://localhost:5000/schedule_delete", {
          method: "DELETE",
          headers: {
            "Content-type": "application/json",
            Authorization: "Bearer " + localStorage.getItem("reuPlanToken"),
          },
          body: JSON.stringify({
            id: id,
          }),
        })
          .then((resp) => {
            if (resp.status == 200) {
              actions.getAuth();
              actions.triggerGeneralToast("Horario eliminado", "primary");
              actions.mainEventView(
                localStorage.getItem("reuPlanCurrentEvent"),
                navigate
              );
              actions.userInvitesAndResponses();

              return resp.json();
            }
          })
          .then((data) => {
            if (data != undefined) {
            }
          })
          .catch((error) => {});
      },
      userBlocksToDate: () => {
        //transforma los bloques del usuario en un arreglo con arreglos [Date,h,id]
        const currentStore = getStore();
        const userID = localStorage.getItem("reuPlanUserID");
        const userBlocksAsDates = [];
        const userBlocks = currentStore.currentEventResponses.filter(
          (respuesta) => respuesta.idInvitado == userID
        );
        const userBlocksDeletable = userBlocks.map((block) => {
          let fecha = new Date(block.fecha+" T13:00:00Z")
          return [
            fecha,
            [block.inicio, block.final],
            block.id,
          ];
        });
        setStore({ bloquesUsuarioActual: userBlocksDeletable });
      },
      meetingResultsToDate: () => {
        //Transforma las fechas resultantes en arreglos separados [Date,horario]
        const currentStore = getStore();
        const meetingResults = currentStore.horarios.filter(
          (element) => element[3] != ""
        );
        const dateAndSchedule = meetingResults.map(([y, m, d, h, id]) => {
          return [
            new Date(y.slice(1, 5), m.slice(1, 3) - 1, d.slice(1, 3)),
            h,
            y,
            m,
            d,
          ];
        });
        const result = [];
        dateAndSchedule.forEach((element) => {
          element[1].forEach((schedule) => {
            result.push([
              element[0],
              schedule,
              element[2],
              element[3],
              element[4],
            ]);
          });
        });
        setStore({ fechasPosiblesSeparadas: result });
      },
      countCalendar: () => {
        const actions = getActions();
        //Analiza todas las disponibilidades de invitados y las calcula para el calendario final
        const store = getStore();
        const fechas = [];
        const contadorDias = new Date(store.evento.inicio);
        let totalDays;
        if (store.evento.final) {
          totalDays = //cantidad de dias en que puede hacerse el evento
            (store.evento.final.getTime() - store.evento.inicio.getTime()) /
            (1000 * 3600 * 24);
        }

        for (let i = 0; i <= totalDays; i++) {
          //agrega a fechas las posibles fechas en formato yyyy-mm-dd
          fechas.push(contadorDias.toISOString().slice(0, 10));
          contadorDias.setDate(contadorDias.getDate() + 1);
        }

        let availableDays = []; //generar de las fechas las tuplas [yxxxx,mxx,dxx] para generar cada dia
        fechas.forEach((fecha) => {
          availableDays.push([
            "y" + fecha.slice(0, 4),
            "m" + fecha.slice(5, 7),
            "d" + fecha.slice(8, 10),
          ]);
        });

        setStore({ horarios: [] });
        availableDays.forEach(([anno, mes, dia]) => {
          //Por cada fecha en que el evento es posible mira las posibilidades de los asistentes
          let countingCalendar = new Array(24);
          countingCalendar.fill(0, 0);
          let booleanCalendar = new Array(24);
          let possibleHours = [];
          let possibleBlock = [];

          for (let respuesta of store.evento.respuestas) {
            //respuesta por invitado => horario de booleanos => countingCalendar muestra la suma de true's (asistencias)
            booleanCalendar = booleanCalendar.map((element) => 0);
            if (respuesta[anno][mes][dia]) {
              for (let horario of respuesta[anno][mes][dia]) {
                booleanCalendar.fill(true, horario[0] / 100, horario[1] / 100);
              }
            }

            booleanCalendar.forEach((hour, i) => {
              if (hour === true) {
                countingCalendar[i] += 1;
              }
            });
          }
          countingCalendar.forEach((hour, i) => {
            // por cada bloque: Suma de asistencias = Cantidad de asistentes ? = ese bloque es posible
            if (
              store.evento.respondidos.length > 0 &&
              hour == store.evento.respondidos.length
            ) {
              possibleHours.push(i);
            }
          });
          //Condiciones para ver como se comporta cada bloque de una hora para generar los pares [inicio,final]
          if (possibleHours.length == 0) {
            //No hay bloques posibles
            setStore({
              horarios: [
                ...store.horarios,
                [anno, mes, dia, [], store.evento.idEvento],
              ],
            });
          } else {
            possibleBlock.push([possibleHours[0], possibleHours[0] + 1]);
            possibleHours.forEach((hour, i) => {
              if (i == 0 && possibleHours[i + 1] - hour > 1) {
                //El bloque a es el primero y esta solo => [[a,a+1],...]
              } else if (possibleHours.length == 1) {
                //El bloque a es el único  [[a,a+1]]
              } else if (
                possibleHours[i + 1] - hour == 1 && //El bloque a esta rodeado de bloques consecutivos => no cambia las tuplas
                hour - possibleHours[i - 1] == 1
              ) {
              } else if (
                i == possibleHours.length - 1 && //El bloque a es el último y está solo => [...[a,a+1]]
                hour - possibleHours[i - 1] > 1
              ) {
                possibleBlock.push([hour, hour + 1]);
              } else if (i == possibleHours.length - 1) {
                //El bloque a es el último => [...,[x,a]]
                possibleBlock[possibleBlock.length - 1][1] = hour + 1;
              } else if (possibleHours[i + 1] - hour > 1) {
                //El bloque no es último y cierra un bloque consecutivo => [...,[x,a+1],...]
                possibleBlock[possibleBlock.length - 1][1] = hour + 1;
              } else if (hour - possibleHours[i - 1] > 1) {
                //El bloque no es el primero y abre bloques consecutivos [...,[a,x],...]
                possibleBlock.push([hour, hour + 1]);
              }
            });

            setStore({
              horarios: [
                ...store.horarios,
                [anno, mes, dia, possibleBlock, store.evento.idEvento],
              ], //possibleBlock es un array con arrays del tipo [inicio,final] de horarios posibles
            });
          }
        });
        actions.meetingResultsToDate();
      },
    },
  };
};
export default getState;
