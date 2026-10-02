document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAdminSession()) return;

  renderAdminShell('Settings');

  const form =
    document.getElementById('settings-form');

  const tabs =
    document.querySelectorAll('.settings-tab');

  const panes =
    document.querySelectorAll('.settings-pane');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(item =>
        item.classList.remove('active')
      );

      panes.forEach(pane =>
        pane.classList.remove('active')
      );

      tab.classList.add('active');

      const pane =
        document.querySelector(
          `.settings-pane[data-pane="${tab.dataset.pane}"]`
        );

      if (pane) {
        pane.classList.add('active');
      }
    });
  });

  function setValue(id, value) {
    const element = document.getElementById(id);

    if (element && value !== undefined && value !== null) {
      element.value = value;
    }
  }

  try {
    const result = await getAdminSettings();

    const settings =
      result.settings ||
      result.data ||
      result;

    setValue(
      's-business-name',
      settings.businessName
    );

    setValue(
      's-tagline',
      settings.tagline
    );

    setValue(
      's-address',
      settings.address
    );

    setValue(
      's-phone',
      settings.phone
    );

    setValue(
      's-whatsapp',
      settings.whatsapp
    );

    setValue(
      's-support-email',
      settings.supportEmail
    );

    setValue(
      's-instagram',
      settings.social?.instagram
    );

    setValue(
      's-tiktok',
      settings.social?.tiktok
    );

    setValue(
      's-facebook',
      settings.social?.facebook
    );

    setValue(
      's-provider',
      settings.paymentProvider
    );
  } catch (error) {
    HADERA.toast(
      error.message ||
      'Unable to load settings.',
      'error'
    );
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const submitBtn =
      form.querySelector('button[type="submit"]');

    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving…';

    const settings = {
      businessName:
        document.getElementById(
          's-business-name'
        ).value.trim(),

      tagline:
        document.getElementById(
          's-tagline'
        ).value.trim(),

      address:
        document.getElementById(
          's-address'
        ).value.trim(),

      phone:
        document.getElementById(
          's-phone'
        ).value.trim(),

      whatsapp:
        document.getElementById(
          's-whatsapp'
        ).value.trim(),

      supportEmail:
        document.getElementById(
          's-support-email'
        ).value.trim(),

      paymentProvider:
        document.getElementById(
          's-provider'
        ).value,

      social: {
        instagram:
          document.getElementById(
            's-instagram'
          ).value.trim(),

        tiktok:
          document.getElementById(
            's-tiktok'
          ).value.trim(),

        facebook:
          document.getElementById(
            's-facebook'
          ).value.trim(),
      },
    };

    /*
     * Do NOT send SMTP passwords or payment secret keys
     * from this frontend form.
     *
     * Those credentials belong in the backend environment.
     */

    try {
      await updateAdminSettings(settings);

      HADERA.toast(
        'Settings saved.',
        'success'
      );
    } catch (error) {
      HADERA.toast(
        error.message ||
        'Unable to save settings.',
        'error'
      );
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Save settings';
    }
  });
});