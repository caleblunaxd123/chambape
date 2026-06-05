/**
 * Schema.org markup para ChambaPe
 * Mejora la visibilidad en Google para búsquedas locales
 * @author Caleb Luna | Luna IT Solutions
 */
export function SchemaOrgMarketplace() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://www.chambape.pe/#website",
        "url": "https://www.chambape.pe",
        "name": "ChambaPe",
        "description": "Marketplace de servicios técnicos del hogar en Lima, Perú",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://www.chambape.pe/solicitudes?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "Organization",
        "@id": "https://www.chambape.pe/#organization",
        "name": "ChambaPe",
        "url": "https://www.chambape.pe",
        "logo": "https://www.chambape.pe/logo.png",
        "description": "Conectamos a técnicos verificados con personas que necesitan servicios del hogar en Lima, Perú",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Lima",
          "addressRegion": "Lima",
          "addressCountry": "PE"
        },
        "sameAs": [
          "https://www.facebook.com/chambape",
          "https://www.instagram.com/chambape",
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "customer service",
          "availableLanguage": "Spanish"
        }
      },
      {
        "@type": "Service",
        "name": "Marketplace de Técnicos del Hogar",
        "provider": { "@id": "https://www.chambape.pe/#organization" },
        "areaServed": {
          "@type": "City",
          "name": "Lima",
          "containsPlace": [
            "Miraflores", "San Isidro", "Surco", "La Molina", "San Borja",
            "Barranco", "Jesús María", "Lince", "Magdalena", "Pueblo Libre",
            "San Miguel", "Independencia", "Los Olivos", "Comas", "Ate"
          ].map(d => ({ "@type": "City", "name": d }))
        },
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Servicios del Hogar",
          "itemListElement": [
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Gasfitería y Plomería" } },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Electricidad e Instalaciones" } },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Pintura de interiores y exteriores" } },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Carpintería y muebles" } },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Cerrajería" } },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Limpieza del hogar" } },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Fumigación y control de plagas" } },
            { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Mudanzas y fletes" } },
          ]
        }
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// FAQ Schema para aparecer en rich results de Google
export function SchemaOrgFAQ() {
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "¿Cómo encuentro un gasfitero confiable en Lima?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "En ChambaPe puedes encontrar gasfiteros verificados con DNI, fotos de trabajos anteriores y reviews de clientes reales. Publica tu solicitud gratis y recibe presupuestos en minutos."
        }
      },
      {
        "@type": "Question",
        "name": "¿Cuánto cobra un electricista en Lima?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Los electricistas en Lima cobran entre S/60 y S/200 según el trabajo. En ChambaPe recibes múltiples presupuestos de electricistas verificados para comparar precios."
        }
      },
      {
        "@type": "Question",
        "name": "¿Los técnicos de ChambaPe son confiables?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sí. Todos los técnicos pasan por verificación de DNI con selfie y revisión de antecedentes antes de ser aprobados en la plataforma."
        }
      },
      {
        "@type": "Question",
        "name": "¿Cómo publicar un trabajo en ChambaPe?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Es gratis y toma 2 minutos: describe el trabajo, sube fotos si tienes, indica tu distrito y recibe propuestas de técnicos disponibles cerca de ti."
        }
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
    />
  );
}
