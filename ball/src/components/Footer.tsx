import React from 'react';

const Footer: React.FC = () => {
  const isDarkMode = true; // Cambiar según el estado de tu aplicación o lógica de tema

  return (
    <footer className={`py-12 transition-colors duration-500 ${isDarkMode ? 'bg-gray-950 text-gray-100' : 'bg-gray-900 text-white'}`}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">Sons of Football</h3>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-300'}>Donde la pasión se encuentra con el campo.</p>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-4">Enlaces Rápidos</h4>
              <ul className="space-y-2">
                <li><a href="#" className={`${isDarkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-300 hover:text-red-300'} transition-colors duration-300`}>Sobre Nosotros</a></li>
                <li><a href="#" className={`${isDarkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-300 hover:text-red-300'} transition-colors duration-300`}>Política de Privacidad</a></li>
                <li><a href="#" className={`${isDarkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-300 hover:text-red-300'} transition-colors duration-300`}>Términos y Condiciones</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-bold mb-4">Síguenos</h4>
              <div className="flex justify-center space-x-4">
                <a href="https://api.whatsapp.com/send/?phone=608608332&text=%C2%A1Hola%21%EF%BF%BD+Tengo+alguna+duda%2C+%C2%BFMe+pod%C3%A9is+ayudar%3F&type=phone_number&app_absent=0" className={`${isDarkMode ? 'text-gray-400 hover:text-green-400' : 'text-gray-300 hover:text-green-300'} transition-colors duration-300`}>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M20.463 3.488C18.217 1.24 15.231 0 12.05 0 5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893 0-3.181-1.237-6.167-3.48-8.413zM12.05 21.785h-.004a9.867 9.867 0 01-5.031-1.378l-.36-.214-3.741.981 1-3.648-.235-.374a9.844 9.844 0 01-1.51-5.26c.002-5.45 4.437-9.884 9.89-9.884 2.64 0 5.122 1.03 6.988 2.898a9.837 9.837 0 012.893 6.994c-.003 5.45-4.437 9.885-9.89 9.885zm5.418-7.403c-.298-.149-1.765-.87-2.037-.97-.272-.099-.47-.148-.669.15-.198.296-.768.968-.942 1.166-.173.198-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.496.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.241-.579-.486-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.57-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="https://www.instagram.com/aps_sons_of_football/?igsh=YTNlN3NrYW96OGU4" className={`${isDarkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-300 hover:text-red-300'} transition-colors duration-300`}>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center">
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-300'}>&copy; 2024 Sons of Football. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
  );
};

export default Footer;
