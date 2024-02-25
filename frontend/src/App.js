import "bootstrap/dist/js/bootstrap.min.js";
import "bootstrap/dist/css/bootstrap.min.css";
import injectContext, { Context } from "./store/context";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Evento from "./views/Evento.js";
import Footer from "./components/Footer.jsx";
import "./custom.css";
import CreateEvent from "./views/CreateEvent.js";
import EditEvent from "./views/EditEvent.js";
import Navbar from "./components/Navbar.jsx";
import LoggedInNavbar from "./components/LoggedInNavbar.jsx";
import Login from "./views/Login.js";
import Welcome from "./views/WelcomeSplash.js";
import "./custom.css";
import EventList from "./views/EventList.js";
import SignIn from "./views/SignIn.js";
import Profile from "./views/Profile.js";
import ScrollToAnchor from "./components/ScrollToAnchor.jsx";
import ToastComponent from "./components/AlertToast.jsx";
import { useContext, useEffect } from "react";

function App() {
  const { store, actions } = useContext(Context);
  useEffect(()=>{actions.getAuth()},[])
  return (
    <div className="App d-flex flex-column min-vh-100">
      <BrowserRouter>
        <ScrollToAnchor />
        <Navbar />
        <Routes>
          <Route path="/login" Component={Login} />
          <Route path="/signin" Component={SignIn} />
          <Route path="/profile" Component={Profile} />
          <Route path="/" Component={Welcome} />
          <Route path="/create" Component={CreateEvent} />
          <Route path="/eventList" Component={EventList} />
          <Route path="/evento/:eventID">
            <Route index Component={Evento}/>
            <Route path="edit" Component={EditEvent} />
          </Route>

          <Route render={() => <h1>Not found!</h1>} />
        </Routes>
        <ToastComponent
          message={store.generalToast.message}
          type={store.generalToast.type}
          showToast={store.generalToast.state}
        />
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default injectContext(App);
