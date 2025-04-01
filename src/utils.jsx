export const capitalizeFirstLetter = (name) => {
  if (!name) return '';
  return name.charAt(0).toUpperCase() + name.slice(1);
};
export const formatDate = (date )=> {
  const formattedDate = new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return formattedDate
}
export const formatAppointmentDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};
export const transformName = (name) => {
  return name?.toUpperCase().replace(/\s+/g, '_');
};

export const formatSpecialization = (text) => {
  return text
    ?.toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
export const formatAppointments = (data) => {
  const formattedAppointments = {};

  data.forEach((item) => {
    const { date, time, name } = item;

    // Format time (e.g., 16:30 -> 4:30 PM)
    const formattedTime = new Date(
      0, 0, 0, time.hour, time.minute, time.second
    ).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true, // 12-hour format
    });

    formattedAppointments[date] = {
      time: formattedTime,
      description: `Appointment with ${name}`,
    };
  });

  return formattedAppointments;
};

export const formatNumber = (number) => {
  return new Intl.NumberFormat('en-US').format(number);
};

export const getToken = ()=> {
  return JSON.parse(localStorage.getItem('authToken'))?.token;
}

export const formatTime = (time) => {
  const [hours, minutes, seconds] = time.split(':');
  const date = new Date();
  date.setHours(hours, minutes, seconds);

  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
};

export const getUserData = () => {
  return JSON.parse(localStorage.getItem('userData'));
}

export const getId = () =>{
  return JSON.parse(localStorage.getItem('userData'))?.id
}