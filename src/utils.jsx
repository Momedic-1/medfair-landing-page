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