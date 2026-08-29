"use strict";


/* =========================================
   CONTACT FORM
========================================= */

const contactForm =
    document.getElementById("contactForm");

const formMessage =
    document.getElementById("formMessage");


if (contactForm) {

    contactForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const formData =
                new FormData(contactForm);


            const name =
                formData.get("name")?.trim() || "";

            const contact =
                formData.get("contact")?.trim() || "";

            const message =
                formData.get("message")?.trim() || "";


            if (
                !name ||
                !contact ||
                !message
            ) {

                formMessage.textContent =
                    "Заполните все поля.";

                return;
            }


            formMessage.textContent =
                "Заявка отправлена. Скоро свяжемся с вами.";


            contactForm.reset();

        }
    );

}


/* =========================================
   SMOOTH SCROLL
========================================= */

document.querySelectorAll(
    'a[href^="#"]'
).forEach(link => {

    link.addEventListener(
        "click",
        function (event) {

            const targetId =
                this.getAttribute("href");


            if (
                !targetId ||
                targetId === "#"
            ) {

                return;
            }


            const target =
                document.querySelector(
                    targetId
                );


            if (!target) {
                return;
            }


            event.preventDefault();


            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }
    );

});


/* =========================================
   HEADER SHADOW
========================================= */

const header =
    document.querySelector(".header");


function updateHeader() {

    if (!header) {
        return;
    }


    if (window.scrollY > 20) {

        header.style.boxShadow =
            "0 10px 35px rgba(45, 49, 66, .12)";

    } else {

        header.style.boxShadow =
            "none";

    }

}


window.addEventListener(
    "scroll",
    updateHeader
);


updateHeader();