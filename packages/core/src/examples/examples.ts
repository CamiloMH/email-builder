import {
  BlockType,
  ButtonVariant,
  SocialPlatform,
  type BlockOfType,
  type BlockProps,
  type BlockType as BlockTypeValue,
} from '../blocks/block.schema';
import { Align } from '../common/color.schema';
import { generateId } from '../common/id';
import { DEFAULT_THEME, type Theme } from '../theme/theme.schema';
import { ExampleSector, type ExampleTemplate } from './example-template';

const SANS = DEFAULT_THEME.typography.fontFamily;
const SERIF = "Georgia, 'Times New Roman', serif";

// Builds a block with a fresh id and strongly-typed props.
const block = <T extends BlockTypeValue>(type: T, props: BlockProps<T>): BlockOfType<T> =>
  ({ id: generateId(), type, props }) as BlockOfType<T>;

// Builds a theme by overriding the default palette/typography for a sector.
const sectorTheme = (
  colors: Partial<Theme['colors']>,
  fontFamily: string,
  borderRadius: number = DEFAULT_THEME.layout.borderRadius,
): Theme => ({
  colors: { ...DEFAULT_THEME.colors, ...colors },
  typography: { ...DEFAULT_THEME.typography, fontFamily },
  layout: { ...DEFAULT_THEME.layout, borderRadius },
});

// Helper to build a columns block from heading/text pairs.
const columns = (items: ReadonlyArray<{ heading: string; text: string }>) =>
  block(BlockType.Columns, {
    columns: items.map((item) => ({ id: generateId(), heading: item.heading, text: item.text })),
  });

// Helper to build a social block from platform/url pairs.
const social = (links: ReadonlyArray<{ platform: SocialPlatform; url: string }>) =>
  block(BlockType.Social, {
    links: links.map((link) => ({ id: generateId(), platform: link.platform, url: link.url })),
  });

/**
 * Curated, professional starter templates, one per industry. Each `build()`
 * returns a fresh document so copies are independent.
 */
export const EXAMPLE_TEMPLATES: readonly ExampleTemplate[] = [
  {
    id: 'ecommerce-oferta',
    name: 'Oferta de e-commerce',
    sector: ExampleSector.Ecommerce,
    description: 'Campaña de descuentos con producto destacado y llamada a la acción.',
    accentColor: '#111827',
    build: () => ({
      name: 'Oferta de e-commerce',
      theme: sectorTheme(
        { primary: '#111827', secondary: '#F59E0B', background: '#F3F4F6', muted: '#6B7280' },
        SANS,
      ),
      blocks: [
        block(BlockType.Header, {
          title: 'Black Friday: hasta -50%',
          subtitle: 'Solo este fin de semana',
          align: Align.Center,
        }),
        block(BlockType.Image, {
          src: 'https://placehold.co/600x240/111827/FFFFFF/png?text=Black+Friday',
          alt: 'Promoción Black Friday',
          widthPercent: 100,
        }),
        block(BlockType.Text, {
          text: 'Renueva tu armario con las mejores marcas a precios que no volverás a ver. Envío gratis en pedidos superiores a 30 €.',
          align: Align.Center,
          fontSize: 16,
        }),
        block(BlockType.Button, {
          label: 'Comprar ahora',
          href: 'https://example.com/tienda',
          align: Align.Center,
          variant: ButtonVariant.Filled,
          fullWidth: true,
        }),
        columns([
          { heading: 'Envío gratis', text: 'En pedidos superiores a 30 €.' },
          { heading: 'Devoluciones', text: '30 días sin coste.' },
          { heading: 'Pago seguro', text: 'Cifrado de extremo a extremo.' },
        ]),
        block(BlockType.Footer, {
          companyName: 'Acme Store',
          address: 'Calle Comercio 1, Madrid',
          unsubscribeUrl: 'https://example.com/baja',
          text: 'Recibes este email por estar suscrito a nuestras ofertas.',
        }),
      ],
    }),
  },
  {
    id: 'saas-bienvenida',
    name: 'Bienvenida SaaS',
    sector: ExampleSector.Saas,
    description: 'Onboarding de bienvenida con primeros pasos y acceso al panel.',
    accentColor: '#2563EB',
    build: () => ({
      name: 'Bienvenida SaaS',
      theme: sectorTheme({ primary: '#2563EB', secondary: '#7C3AED' }, SANS),
      blocks: [
        block(BlockType.Header, {
          title: 'Te damos la bienvenida a Flowboard',
          subtitle: 'Tu espacio de trabajo ya está listo',
          align: Align.Left,
        }),
        block(BlockType.Text, {
          text: 'Gracias por unirte. En tres pasos tendrás tu primer proyecto en marcha y a tu equipo colaborando.',
          align: Align.Left,
          fontSize: 16,
        }),
        block(BlockType.Card, {
          title: 'Empieza en 2 minutos',
          text: 'Crea tu primer proyecto e invita a tu equipo para empezar a colaborar hoy mismo.',
          buttonLabel: 'Ir al panel',
          buttonHref: 'https://example.com/app',
          backgroundColor: '#EFF6FF',
          align: Align.Left,
        }),
        columns([
          { heading: '1. Crea', text: 'Tu primer proyecto.' },
          { heading: '2. Invita', text: 'A tu equipo.' },
          { heading: '3. Automatiza', text: 'Tus flujos de trabajo.' },
        ]),
        block(BlockType.Divider, {}),
        block(BlockType.Footer, {
          companyName: 'Flowboard Inc.',
          text: '¿Necesitas ayuda? Responde a este correo y te ayudamos.',
          unsubscribeUrl: 'https://example.com/unsubscribe',
        }),
      ],
    }),
  },
  {
    id: 'newsletter-medios',
    name: 'Newsletter editorial',
    sector: ExampleSector.Newsletter,
    description: 'Boletín semanal con titulares destacados y enlaces a artículos.',
    accentColor: '#0F172A',
    build: () => ({
      name: 'Newsletter editorial',
      theme: sectorTheme(
        { primary: '#0F172A', secondary: '#2563EB', muted: '#475569' },
        SERIF,
        4,
      ),
      blocks: [
        block(BlockType.Header, {
          title: 'El Resumen Semanal',
          subtitle: 'Las noticias que importan · Nº 42',
          align: Align.Left,
        }),
        block(BlockType.Text, {
          text: 'Una selección editorial de lo más relevante de la semana en tecnología y negocio. Para leer en cinco minutos.',
          align: Align.Left,
          fontSize: 16,
        }),
        block(BlockType.Divider, {}),
        columns([
          { heading: 'Mercados', text: 'Por qué las startups vuelven a captar capital.' },
          { heading: 'IA', text: 'El nuevo modelo que cambia las reglas.' },
          { heading: 'Producto', text: 'Cinco lecciones de equipos que escalan.' },
        ]),
        block(BlockType.Button, {
          label: 'Leer la edición completa',
          href: 'https://example.com/newsletter',
          align: Align.Left,
          variant: ButtonVariant.Outline,
          fullWidth: false,
        }),
        social([
          { platform: SocialPlatform.Twitter, url: 'https://twitter.com/redaccion' },
          { platform: SocialPlatform.LinkedIn, url: 'https://linkedin.com/company/redaccion' },
        ]),
        block(BlockType.Footer, {
          companyName: 'La Redacción',
          unsubscribeUrl: 'https://example.com/unsubscribe',
          text: 'Recibes este boletín porque te suscribiste.',
        }),
      ],
    }),
  },
  {
    id: 'restaurante-carta',
    name: 'Reserva de restaurante',
    sector: ExampleSector.Restaurant,
    description: 'Nueva carta de temporada con foto de plato y reserva de mesa.',
    accentColor: '#B45309',
    build: () => ({
      name: 'Reserva de restaurante',
      theme: sectorTheme(
        {
          primary: '#B45309',
          secondary: '#7C2D12',
          background: '#FFFBEB',
          text: '#1C1917',
          muted: '#78716C',
        },
        SERIF,
        12,
      ),
      blocks: [
        block(BlockType.Header, {
          logoUrl: 'https://placehold.co/120x40/B45309/FFFFFF/png?text=Bistro',
          title: 'Sabores de temporada',
          subtitle: 'Estrenamos carta de otoño',
          align: Align.Center,
        }),
        block(BlockType.Image, {
          src: 'https://placehold.co/600x260/B45309/FFFFFF/png?text=Plato',
          alt: 'Plato de temporada',
          widthPercent: 100,
        }),
        block(BlockType.Text, {
          text: 'Descubre nuestra nueva carta con productos locales de temporada. Reserva tu mesa y vive una experiencia única.',
          align: Align.Center,
          fontSize: 16,
        }),
        block(BlockType.Card, {
          title: 'Menú degustación',
          text: 'Siete pasos maridados con vinos de la región. Disponible de jueves a domingo.',
          buttonLabel: 'Reservar mesa',
          buttonHref: 'https://example.com/reservar',
          backgroundColor: '#FFFFFF',
          align: Align.Center,
        }),
        block(BlockType.Footer, {
          companyName: 'Bistró Aurora',
          address: 'Av. Gastronomía 12, Valencia',
          unsubscribeUrl: 'https://example.com/baja',
          text: 'Te esperamos.',
        }),
      ],
    }),
  },
  {
    id: 'salud-cita',
    name: 'Recordatorio de cita',
    sector: ExampleSector.Health,
    description: 'Recordatorio de cita médica con detalles y confirmación.',
    accentColor: '#0D9488',
    build: () => ({
      name: 'Recordatorio de cita',
      theme: sectorTheme(
        {
          primary: '#0D9488',
          secondary: '#0F766E',
          background: '#F0FDFA',
          text: '#134E4A',
          muted: '#5F6B6A',
        },
        SANS,
        12,
      ),
      blocks: [
        block(BlockType.Header, {
          title: 'Recordatorio de tu cita',
          subtitle: 'Clínica Vitalia',
          align: Align.Left,
        }),
        block(BlockType.Text, {
          text: 'Hola, te recordamos tu próxima cita. Por favor, confírmala con al menos 24 horas de antelación.',
          align: Align.Left,
          fontSize: 16,
        }),
        block(BlockType.Card, {
          title: 'Martes 24 de junio · 10:30',
          text: 'Dr. Martín · Consulta de cardiología · Planta 2, sala 4.',
          buttonLabel: 'Confirmar cita',
          buttonHref: 'https://example.com/confirmar',
          backgroundColor: '#FFFFFF',
          align: Align.Left,
        }),
        columns([
          { heading: 'Antes de venir', text: 'Trae tu documento y pruebas previas.' },
          { heading: '¿No puedes asistir?', text: 'Reprograma desde tu área de paciente.' },
        ]),
        block(BlockType.Footer, {
          companyName: 'Clínica Vitalia',
          address: 'C/ Salud 8, Sevilla',
          unsubscribeUrl: 'https://example.com/baja',
          text: 'Mensaje automático, por favor no respondas a este correo.',
        }),
      ],
    }),
  },
  {
    id: 'evento-invitacion',
    name: 'Invitación a evento',
    sector: ExampleSector.Event,
    description: 'Invitación con fecha, lugar y confirmación de asistencia.',
    accentColor: '#7C3AED',
    build: () => ({
      name: 'Invitación a evento',
      theme: sectorTheme(
        { primary: '#7C3AED', secondary: '#DB2777', background: '#FAF5FF', text: '#2E1065' },
        SANS,
        12,
      ),
      blocks: [
        block(BlockType.Header, {
          title: 'Estás invitado',
          subtitle: 'Lanzamiento Producto 2025',
          align: Align.Center,
        }),
        block(BlockType.Image, {
          src: 'https://placehold.co/600x240/7C3AED/FFFFFF/png?text=Evento',
          alt: 'Imagen del evento',
          widthPercent: 100,
        }),
        block(BlockType.Text, {
          text: 'Acompáñanos a la presentación de nuestro nuevo producto. Habrá demos, networking y una sorpresa final.',
          align: Align.Center,
          fontSize: 16,
        }),
        block(BlockType.Card, {
          title: 'Reserva tu plaza',
          text: '12 de julio · 18:00 · Auditorio Central, Barcelona. Aforo limitado: confirma antes del 5 de julio.',
          buttonLabel: 'Confirmar asistencia',
          buttonHref: 'https://example.com/rsvp',
          backgroundColor: '#FFFFFF',
          align: Align.Center,
        }),
        social([
          { platform: SocialPlatform.Instagram, url: 'https://instagram.com/eventosnova' },
          { platform: SocialPlatform.LinkedIn, url: 'https://linkedin.com/company/eventosnova' },
        ]),
        block(BlockType.Footer, {
          companyName: 'Eventos Nova',
          unsubscribeUrl: 'https://example.com/baja',
          text: 'Te esperamos.',
        }),
      ],
    }),
  },
];
