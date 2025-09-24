import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

type Feature = { title: string; text: string; icon: string };
type Area = { name: string; desc: string; img: string };

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing-page.html'
})
export class LandingPage {
  // Navbar simple (ancoras internas)
  nav = [
    { label: 'Nosotros',   fragment: 'nosotros' },
    { label: 'Pacientes',  fragment: 'pacientes' },
    { label: 'Experiencia',fragment: 'experiencia' },
    { label: 'Contacto',   fragment: 'contacto' },
  ];

  // Ejes / cultura
  features: Feature[] = [
    { title: 'Atención centrada en el usuario', icon: '👥', text: 'Servicio cercano y humanizado.' },
    { title: 'Gestión clínica excelente',       icon: '✅', text: 'Protocolos y control de calidad.' },
    { title: 'Gestión de la tecnología',        icon: '🔬', text: 'Equipos de última generación.' },
    { title: 'Humanización de la atención',     icon: '💙', text: 'Acompañamiento y empatía.' },
    { title: 'Gestión del riesgo',              icon: '⚖️', text: 'Seguridad del paciente primero.' },
    { title: 'Transformación cultural',         icon: '🔁', text: 'Mejora continua y aprendizaje.' },
  ];

  // Áreas de experiencia
  areas: Area[] = [
    {
      name: 'Hematología',
      desc: 'Estudio de la sangre y sus trastornos: anemias, coagulación, leucemias.',
      img: 'landing/hematologia.jpg'
    },
    {
      name: 'Química clínica',
      desc: 'Perfiles metabólicos, lípidos, enzimas, electrolitos, función renal y hepática.',
      img: 'landing/quimica.jpg'
    },
    {
      name: 'Inmunología',
      desc: 'Autoinmunidad, alergias y marcadores inmunológicos.',
      img: 'landing/inmunologia.png'
    },
    {
      name: 'Microbiología',
      desc: 'Cultivos, identificación y antibiograma de microorganismos.',
      img: 'landing/micro.png'
    },
    {
      name: 'Pruebas infecciosas',
      desc: 'Detección por antígenos, anticuerpos o biología molecular.',
      img: 'landing/infecciosas.jpg'
    },
    {
      name: 'Coagulación',
      desc: 'Evaluación de tiempos y trastornos de coagulación.',
      img: 'landing/coagulacion.jpg'
    },
  ];
}
