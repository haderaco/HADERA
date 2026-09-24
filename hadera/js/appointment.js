document.addEventListener('DOMContentLoaded', () => {
  const { toast } = HADERA;

  const form = document.getElementById('appointment-form');
  const submitBtn = document.getElementById('apt-submit-btn');
  const successEl = document.getElementById('apt-success');

  if (!form) return;

  const requiredFields = [
    'fullName',
    'email',
    'phone',
    'service',
    'date',
    'time',
  ];

  function validate() {
    let valid = true;

    requiredFields.forEach(name => {
      const input = form.elements[name];

      if (!input) return;

      const field = input.closest('.field');

      let ok = input.value.trim().length > 0;

      if (name === 'email' && ok) {
        ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          input.value.trim()
        );
      }

      if (name === 'phone' && ok) {
        ok = input.value.trim().replace(/\D/g, '').length >= 10;
      }

      if (field) {
        field.classList.toggle('error', !ok);
      }

      if (!ok) valid = false;
    });

    return valid;
  }

  requiredFields.forEach(name => {
    const input = form.elements[name];

    if (input) {
      input.addEventListener('blur', validate);
    }
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();

    if (!validate()) {
      toast('Please fix the highlighted fields.', 'error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending request…';

    const data = Object.fromEntries(
      new FormData(form).entries()
    );

    try {
      const result = await createAppointment(data);

      form.style.display = 'none';
      successEl.classList.add('show');

      const reference =
        result.appointmentId ||
        result.appointment?.id ||
        result.id;

      document.getElementById('apt-ref').textContent =
        reference || 'Submitted';
    } catch (err) {
      toast(
        err.message || 'Something went wrong. Please try again.',
        'error'
      );

      submitBtn.disabled = false;
      submitBtn.textContent = 'Request appointment';
    }
  });
});