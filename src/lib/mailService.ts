export const sendRecoveryEmail = async (email: string, token: string) => {
  const apiKey = '868d2ded95cb0d2005956656742370e3-9c3f0c68-da6bb63c';
  const domain = 'sandbox27af43738b834fccb52e11e964523535.mailgun.org';
  const url = `https://api.mailgun.net/v3/${domain}/messages`;

  const formData = new FormData();
  formData.append('from', 'Excited User <mailgun@sandbox27af43738b834fccb52e11e964523535.mailgun.org>');
  formData.append('to', email);
  formData.append('subject', 'Password Recovery');
  formData.append('text', `Please use the following token to recover your password: ${token}`);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + btoa(`api:${apiKey}`)
    },
    body: formData
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Error:', error);
  } else {
    const result = await response.json();
    console.log('Success:', result);
  }
};