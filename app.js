"use strict";


/* =====================================================
   TOKKO WEB STUDIO — FRONTEND SECURITY
===================================================== */


/* =====================================================
   CONFIG
===================================================== */

const FORM_COOLDOWN_MS = 30_000;

const MAX_NAME_LENGTH = 80;
const MAX_CONTACT_LENGTH = 120;
const MAX_MESSAGE_LENGTH = 2000;


/* =====================================================
   ELEMENTS
===================================================== */

const contactForm =
    document.getElementById("contactForm");

const formMessage =
    document.getElementById("formMessage");

const header =
    document.querySelector(".header");


/* =====================================================
   HELPERS
===================================================== */

function setMessage(text) {

    if (!formMessage) {
        return;
    }

    // textContent безопаснее innerHTML для
    // пользовательского / серверного текста.
    formMessage.textContent = text;
}


function normalizeText(value) {

    return String(value ?? "")
        .replace(/\u0000/g, "")
        .replace(/\r\n/g, "\n")
        .trim();
}


function limitLength(value, maxLength) {

    return value.slice(0, maxLength);
}


/* =====================================================
   CONTACT VALIDATION
===================================================== */

function validateContactForm(name, contact, message) {

    if (!name) {
        return "Введите ваше имя.";
    }

    if (!contact) {
        return "Введите Telegram или Email.";
    }

    if (!message) {
        return "Расскажите немного о проекте.";
    }


    if (name.length > MAX_NAME_LENGTH) {
        return `Имя слишком длинное. Максимум ${MAX_NAME_LENGTH} символов.`;
    }

    if (contact.length > MAX_CONTACT_LENGTH) {
        return `Контакт слишком длинный. Максимум ${MAX_CONTACT_LENGTH} символов.`;
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
        return `Сообщение слишком длинное. Максимум ${MAX_MESSAGE_LENGTH} символов.`;
    }


    /*
        Простая проверка контакта.

        Не пытаемся сделать идеальный email/Telegram parser,
        потому что это только frontend-проверка.
    */

    const looksLikeEmail =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);

    const looksLikeTelegram =
        /^@?[A-Za-z0-9_]{4,64}$/.test(contact);


    if (
        !looksLikeEmail &&
        !looksLikeTelegram
    ) {

        return "Введите корректный Telegram или Email.";
    }


    return "";
}


/* =====================================================
   LOCAL RATE LIMIT
===================================================== */

function canSubmitForm() {

    const lastSubmit =
        Number(
            localStorage.getItem(
                "tokkoLastFormSubmit"
            ) || "0"
        );

    const now =
        Date.now();


    if (
        now - lastSubmit <
        FORM_COOLDOWN_MS
    ) {

        const seconds =
            Math.ceil(
                (
                    FORM_COOLDOWN_MS -
                    (now - lastSubmit)
                ) / 1000
            );


        setMessage(
            `Подождите ${seconds} сек. перед повторной отправкой.`
        );

        return false;
    }


    localStorage.setItem(
        "tokkoLastFormSubmit",
        String(now)
    );


    return true;
}


/* =====================================================
   HONEYPOT
===================================================== */

function createHoneypot() {

    if (!contactForm) {
        return null;
    }


    /*
        Скрытое поле.

        Обычный пользователь его не заполняет.
        Примитивный бот, который заполняет все поля,
        попадётся на этой проверке.

        Это НЕ замена CAPTCHA.
    */

    const wrapper =
        document.createElement("div");

    wrapper.style.position = "absolute";
    wrapper.style.left = "-10000px";
    wrapper.style.width = "1px";
    wrapper.style.height = "1px";
    wrapper.style.overflow = "hidden";
    wrapper.setAttribute(
        "aria-hidden",
        "true"
    );


    const input =
        document.createElement("input");

    input.type = "text";
    input.name = "website";
    input.tabIndex = -1;
    input.autocomplete = "off";


    wrapper.appendChild(input);

    contactForm.appendChild(wrapper);


    return input;
}


const honeypot =
    createHoneypot();


/* =====================================================
   CONTACT FORM
===================================================== */

if (contactForm) {

    contactForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            setMessage("");


            /* Honeypot */

            if (
                honeypot &&
                honeypot.value.trim() !== ""
            ) {

                // Молча прекращаем обработку.
                return;
            }


            /* Rate limit */

            if (!canSubmitForm()) {
                return;
            }


            const formData =
                new FormData(contactForm);


            let name =
                normalizeText(
                    formData.get("name")
                );

            let contact =
                normalizeText(
                    formData.get("contact")
                );

            let message =
                normalizeText(
                    formData.get("message")
                );


            /*
                Нормализуем длину ещё до дальнейшей
                обработки.
            */

            name =
                limitLength(
                    name,
                    MAX_NAME_LENGTH
                );

            contact =
                limitLength(
                    contact,
                    MAX_CONTACT_LENGTH
                );

            message =
                limitLength(
                    message,
                    MAX_MESSAGE_LENGTH
                );


            const validationError =
                validateContactForm(
                    name,
                    contact,
                    message
                );


            if (validationError) {

                setMessage(
                    validationError
                );

                return;
            }


            /*
                Сейчас форма ещё не отправляется
                на сервер.

                Здесь позже будет:

                fetch("/api/contact", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name,
                        contact,
                        message
                    })
                });
            */


            setMessage(
                "Форма заполнена корректно. Серверную отправку подключим следующим этапом."
            );


            contactForm.reset();

        }
    );

}


/* =====================================================
   SMOOTH SCROLL
===================================================== */

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


/* =====================================================
   HEADER
===================================================== */

function updateHeader() {

    if (!header) {
        return;
    }


    header.style.boxShadow =
        window.scrollY > 20

            ? "0 10px 35px rgba(45, 49, 66, .12)"

            : "none";
}


window.addEventListener(
    "scroll",
    updateHeader,
    {
        passive: true
    }
);


updateHeader();