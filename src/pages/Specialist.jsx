
import React from 'react';

const Specialist = ({ closeModal }) => {
  
  const specialists = [
    { name: 'Psychiatrists', image: '/src/assets/Ícone de perfil de usuário em estilo plano Ilustração em vetor avatar membro em fundo isolado Conceito de negócio de sinal de permissão humana _ Vetor Premium.jpeg' },
    { name: 'Clinical Psychologists', image: '/src/assets/Ícone de perfil de usuário em estilo plano Ilustração em vetor avatar membro em fundo isolado Conceito de negócio de sinal de permissão humana _ Vetor Premium.jpeg' },
    { name: 'Therapists', image: '/src/assets/Ícone de perfil de usuário em estilo plano Ilustração em vetor avatar membro em fundo isolado Conceito de negócio de sinal de permissão humana _ Vetor Premium.jpeg' },
    { name: 'Trauma Specialists', image: '/src/assets/Ícone de perfil de usuário em estilo plano Ilustração em vetor avatar membro em fundo isolado Conceito de negócio de sinal de permissão humana _ Vetor Premium.jpeg' },
  ];

  const handleServiceClick = (serviceName) => {
    alert(`${serviceName} is currently not available.`);
  };
  
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">

        <div className="grid grid-cols-2 gap-6">
          {specialists.map((specialist, index) => (
            <div key={index} className="text-center p-4 rounded-lg bg-gray-100">
              <button onClick={() => handleServiceClick(specialist.name)} className="flex flex-col items-center">
                <img src={specialist.image} alt={specialist.name} className="w-12 h-12 mb-2" />
                <span className="text-lg font-medium">{specialist.name}</span>
              </button>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-4">
          <button onClick={closeModal} className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-all duration-200">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Specialist;
