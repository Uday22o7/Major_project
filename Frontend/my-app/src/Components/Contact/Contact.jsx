
import React, { useRef } from 'react';
import emailjs from '@emailjs/browser';
import './Contact.css';
import { useTheme } from '../../Context/ThemeContext';

export default function Contact() {
  const { theme } = useTheme();
  const form = useRef();

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs
      .sendForm(
        'service_5j6pjei',
        'template_nfhpmht',
        form.current, {
        publicKey: '9pmrFlEWJYdZLbXNe',
      })
      .then(
        () => {
          console.log('SUCCESS!');
          alert("Success");
          // Clear the form fields
          form.current.reset();
        },

        (error) => {
          console.log('FAILED...', error.text);
          alert("Not Success")
        },
      );
  };

  return (
    <div className={`contact-page ${theme}`}>
      <div className="contact-container">
        <div className="contact-header">
          <h1 className="contact-title">Get in Touch</h1>
          <p className="contact-subtitle">We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
        </div>

        <form ref={form} onSubmit={sendEmail} className={`contact-form ${theme}`}>
          <div className="form-group">
            <label className="contact-label">Name</label>
            <input
              className="contact-input"
              type="text"
              name="user_name"
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="form-group">
            <label className="contact-label">Email</label>
            <input
              className="contact-input"
              type="email"
              name="user_email"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label className="contact-label">Message</label>
            <textarea
              className="contact-textarea"
              name="message"
              placeholder="Leave your message here..."
              required
            />
          </div>

          <button className="contact-submit" type="submit">
            Send Message
          </button>
        </form>
      </div>
    </div>
  )
}