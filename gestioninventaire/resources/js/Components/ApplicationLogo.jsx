import React from "react";

export default function ApplicationLogo(props) {
    return (
        <img
            {...props} // pour passer les props comme className, style, etc.
            src="/" // chemin vers ton image
            alt="Logo de l'application"
        />
    );
}
