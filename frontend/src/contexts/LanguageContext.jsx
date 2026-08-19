import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    // Navbar
    'Home': 'Home',
    'AMIVI': 'AMIVI',
    'AMICO': 'AMICO',
    'Quiz': 'Quiz',
    'Library': 'Library',
    'Profile': 'Profile',
    'Student': 'Student',
    'Teacher': 'Teacher',
    'Language': 'Language',
    'Admin': 'Admin',
    'Video': 'Video',

    // Buttons
    'Start Learning': 'Start Learning',
    'Explore AMIVI': 'Explore AMIVI',
    'Create Visuals': 'Create Visuals',
    'Create Comic': 'Create Comic',
    'Start Quiz': 'Start Quiz',
    'Generate': 'Generate',
    'Generate Video': 'Generate Video',
    'Regenerate': 'Regenerate',
    'Edit': 'Edit',
    'Save': 'Save',
    'Download': 'Download',
    'Share': 'Share',
    'Next': 'Next',
    'Previous': 'Previous',
    'Cancel': 'Cancel',
    'Delete': 'Delete',
    'Retry': 'Retry',

    // AMIVI
    'Upload File': 'Upload File',
    'Upload PDF': 'Upload PDF',
    'Upload Word Document': 'Upload Word Document',
    'Upload Image': 'Upload Image',
    'Paste Video Link': 'Paste Video Link',
    'Generate Visuals': 'Generate Visuals',
    'Key Point': 'Key Point',
    'Slogan': 'Slogan',
    'Description': 'Description',
    'Regenerate Image': 'Regenerate Image',

    // AMICO
    'Number of Panels': 'Number of Panels',
    'Horizontal': 'Horizontal',
    'Vertical': 'Vertical',
    'Avatar': 'Avatar',
    'Dialogue': 'Dialogue',
    'Add Panel': 'Add Panel',
    'Remove Panel': 'Remove Panel',
    'Regenerate Panel': 'Regenerate Panel',

    // QUIZ
    'Question': 'Question',
    'Score': 'Score',
    'Correct Answer': 'Correct Answer',
    'Wrong Answer': 'Wrong Answer',
    'Explanation': 'Explanation',
    'Retake Quiz': 'Retake Quiz',
    'Final Score': 'Final Score',
    'Click the correct answer': 'Click the correct answer',

    // LIBRARY
    'My Visuals': 'My Visuals',
    'My Videos': 'My Videos',
    'My Comics': 'My Comics',
    'My Quizzes': 'My Quizzes',
    'My Homework': 'My Homework',
    'Search': 'Search',
    'Filter': 'Filter',
    'Sort': 'Sort',
    'Open': 'Open',
    
    // UI states
    'Loading': 'Loading',
    'Error': 'Error',
    'No content found': 'No content found',
    
    // Settings
    'Settings': 'Settings',
    
    // Auth
    'Login': 'Login',
    'Logout': 'Logout'
  },
  es: {
    // Navbar
    'Home': 'Inicio',
    'AMIVI': 'AMIVI',
    'AMICO': 'AMICO',
    'Quiz': 'Cuestionario',
    'Library': 'Biblioteca',
    'Profile': 'Perfil',
    'Student': 'Estudiante',
    'Teacher': 'Profesor',
    'Language': 'Idioma',
    'Admin': 'Admin',
    'Video': 'Video',

    // Buttons
    'Start Learning': 'Empezar a Aprender',
    'Explore AMIVI': 'Explorar AMIVI',
    'Create Visuals': 'Crear Efectos Visuales',
    'Create Comic': 'Crear Cómic',
    'Start Quiz': 'Empezar Cuestionario',
    'Generate': 'Generar',
    'Generate Video': 'Generar Video',
    'Regenerate': 'Regenerar',
    'Edit': 'Editar',
    'Save': 'Guardar',
    'Download': 'Descargar',
    'Share': 'Compartir',
    'Next': 'Siguiente',
    'Previous': 'Anterior',
    'Cancel': 'Cancelar',
    'Delete': 'Eliminar',
    'Retry': 'Reintentar',

    // AMIVI
    'Upload File': 'Subir Archivo',
    'Upload PDF': 'Subir PDF',
    'Upload Word Document': 'Subir Documento Word',
    'Upload Image': 'Subir Imagen',
    'Paste Video Link': 'Pegar Enlace de Video',
    'Generate Visuals': 'Generar Efectos Visuales',
    'Key Point': 'Punto Clave',
    'Slogan': 'Eslogan',
    'Description': 'Descripción',
    'Regenerate Image': 'Regenerar Imagen',

    // AMICO
    'Number of Panels': 'Número de Viñetas',
    'Horizontal': 'Horizontal',
    'Vertical': 'Vertical',
    'Avatar': 'Avatar',
    'Dialogue': 'Diálogo',
    'Add Panel': 'Añadir Viñeta',
    'Remove Panel': 'Eliminar Viñeta',
    'Regenerate Panel': 'Regenerar Viñeta',

    // QUIZ
    'Question': 'Pregunta',
    'Score': 'Puntuación',
    'Correct Answer': 'Respuesta correcta',
    'Wrong Answer': 'Respuesta incorrecta',
    'Explanation': 'Explicación',
    'Retake Quiz': 'Reintentar Cuestionario',
    'Final Score': 'Puntuación Final',
    'Click the correct answer': 'Haz clic en la respuesta correcta',

    // LIBRARY
    'My Visuals': 'Mis Efectos Visuales',
    'My Videos': 'Mis Videos',
    'My Comics': 'Mis Cómics',
    'My Quizzes': 'Mis Cuestionarios',
    'My Homework': 'Mis Tareas',
    'Search': 'Buscar',
    'Filter': 'Filtrar',
    'Sort': 'Ordenar',
    'Open': 'Abrir',

    // UI states
    'Loading': 'Cargando',
    'Error': 'Error',
    'No content found': 'No se encontró contenido',
    
    // Settings
    'Settings': 'Configuración',
    
    // Auth
    'Login': 'Iniciar Sesión',
    'Logout': 'Cerrar Sesión'
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('vlq_language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('vlq_language', language);
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
