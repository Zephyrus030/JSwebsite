import { useState } from 'react';
import { appointmentTimes, locations, projectTypes } from './contactData';
import styles from './AppointmentForm.module.css';

const initialValues = {
  location: '',
  name: '',
  phone: '',
  email: '',
  date: '',
  time: '',
  projectTypes: [],
  notes: '',
  consent: false,
};

export function validateAppointment(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = 'Enter your full name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Enter a valid email address.';
  }
  if (!values.location) errors.location = 'Choose a visit location.';
  if (!values.date) errors.date = 'Choose a preferred date.';
  if (!values.time) errors.time = 'Choose a preferred time.';
  return errors;
}

export default function AppointmentForm({ onSubmit = async () => undefined }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(event) {
    const { checked, name, type, value } = event.target;
    setValues((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setStatus('');
  }

  function toggleProjectType(event) {
    const { checked, value } = event.target;
    setValues((current) => ({
      ...current,
      projectTypes: checked
        ? [...current.projectTypes, value]
        : current.projectTypes.filter((item) => item !== value),
    }));
  }

  async function submit(event) {
    event.preventDefault();
    const nextErrors = validateAppointment(values);
    setErrors(nextErrors);
    setStatus('');
    if (Object.keys(nextErrors).length) return;

    setIsSubmitting(true);
    await onSubmit(values);
    setIsSubmitting(false);
    setStatus('Thank you. Your appointment request has been received.');
  }

  return (
    <form className={styles.form} noValidate onSubmit={submit}>
      <fieldset className={styles.location}>
        <legend>Visit location</legend>
        <div className={styles.locationOptions}>
          {locations.map((location) => (
            <label key={location.name}>
              <input
                aria-describedby={errors.location ? 'location-error' : undefined}
                aria-invalid={errors.location ? 'true' : undefined}
                checked={values.location === location.name}
                name="location"
                onChange={updateField}
                type="radio"
                value={location.name}
              />
              <span>{location.name}</span>
            </label>
          ))}
        </div>
        {errors.location && <p className={styles.error} id="location-error">{errors.location}</p>}
      </fieldset>

      <div className={styles.fields}>
        <Field error={errors.name} label="Full name" name="name" onChange={updateField} value={values.name} />
        <Field error={errors.phone} label="Phone" name="phone" onChange={updateField} type="tel" value={values.phone} />
        <Field error={errors.email} label="Email" name="email" onChange={updateField} type="email" value={values.email} />
        <Field error={errors.date} label="Preferred date" name="date" onChange={updateField} type="date" value={values.date} />
        <div>
          <label htmlFor="appointment-time">Preferred time</label>
          <select aria-describedby={errors.time ? 'time-error' : undefined} id="appointment-time" name="time" onChange={updateField} value={values.time}>
            <option value="">Select a time</option>
            {appointmentTimes.filter(Boolean).map((time) => <option key={time} value={time}>{time}</option>)}
          </select>
          {errors.time && <p className={styles.error} id="time-error">{errors.time}</p>}
        </div>
      </div>

      <fieldset className={styles.projectTypes}>
        <legend>Project type</legend>
        <div>
          {projectTypes.map((projectType) => (
            <label key={projectType}>
              <input checked={values.projectTypes.includes(projectType)} onChange={toggleProjectType} type="checkbox" value={projectType} />
              <span>{projectType}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className={styles.notes}>
        <span>Tell us about your visit</span>
        <textarea name="notes" onChange={updateField} placeholder="Tell us more about your project and what you’d like to see." rows="4" value={values.notes} />
      </label>

      <label className={styles.consent}>
        <input checked={values.consent} name="consent" onChange={updateField} type="checkbox" />
        <span>I agree to be contacted about this appointment.</span>
      </label>

      <div className={styles.submitRow}>
        <button disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Requesting…' : 'Request appointment'} <span aria-hidden="true">→</span>
        </button>
      </div>
      {status && <p className={styles.status} role="status">{status}</p>}
    </form>
  );
}

function Field({ error, label, name, onChange, type = 'text', value }) {
  const errorId = `${name}-error`;
  return (
    <div>
      <label htmlFor={`appointment-${name}`}>{label}</label>
      <input
        aria-describedby={error ? errorId : undefined}
        id={`appointment-${name}`}
        name={name}
        onChange={onChange}
        type={type}
        value={value}
      />
      {error && <p className={styles.error} id={errorId}>{error}</p>}
    </div>
  );
}
