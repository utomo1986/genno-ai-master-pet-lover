import React from 'react';
import { Crown, Rocket, Palette, Zap, Sparkles, GraduationCap, Heart, Lightbulb,  User, Star, Music, Cloud, Camera,  Gem, Flame, Anchor, Feather, Eye,  Compass,  Cpu, Cake, Snowflake, Ghost, PartyPopper, Sun, HeartHandshake, CalendarDays, Moon, Gift, Flower } from 'lucide-react';
import { Theme } from './types';

export const APP_NAME = "GENNO AI";
export const APP_TAGLINE = "MASTER PET LOVER";

export const STUDIO_THEMES: Theme[] = [
  {
    id: 'professional-pet',
    name: 'Studio Solo (Hewan)',
    description: 'Foto headshot studio profesional yang murni dan tajam.',
    promptModifier: 'A professional studio photography shot of this pet alone. Neutral grey or textured backdrop, soft box lighting, 8k resolution, incredibly detailed fur, sharp focus, commercial photography style.',
    thumbnail: '',
    icon: <Camera className="w-6 h-6" />,
  },
  {
    id: 'intimate-studio',
    name: 'Intimate Studio (Bersama)',
    description: 'Potret studio klasik yang hangat dan akrab.',
    promptModifier: 'A heartwarming professional studio portrait. The human owner is lovingly holding the pet or sitting extremely close cheek-to-cheek. Seamless interaction, loving expressions, soft warm studio lighting, beige or dark grey backdrop, high-end fashion photography style. Realistic proportion between human and pet.',
    thumbnail: '',
    icon: <Heart className="w-6 h-6" />,
  },
];

export const POPULAR_THEMES: Theme[] = [
  {
    id: 'birthday',
    name: 'Ulang Tahun (Birthday)',
    description: 'Pesta meriah dengan topi ultah dan pelukan hangat.',
    promptModifier: 'A festive birthday party celebration. The human is affectionately hugging the pet or holding them up near a birthday cake. Both might be wearing colorful party hats. Confetti, balloons, and bright cheerful lighting. The atmosphere is joyful and intimate. High-quality event photography.',
    thumbnail: '',
    icon: <Cake className="w-6 h-6" />,
  },
  {
    id: 'christmas',
    name: 'Edisi Natal (Christmas)',
    description: 'Pelukan hangat di depan pohon Natal.',
    promptModifier: 'A cozy Christmas holiday portrait. The human is holding the pet close in a warm embrace, cheek to cheek. Both wearing festive knitted sweaters. Background features a lit Christmas tree, fireplace, and soft bokeh lights. Warm golden lighting, magical winter atmosphere, very intimate and family-oriented.',
    thumbnail: '',
    icon: <Snowflake className="w-6 h-6" />,
  },
  {
    id: 'halloween',
    name: 'Halloween Kostum',
    description: 'Kostum lucu dengan pose akrab.',
    promptModifier: 'A spooky but cute Halloween photo. The human and pet are posing together in matching costumes (e.g., wizard and familiar). The human is holding the pet securely. Background of carved Jack-o-lanterns and moody purple/orange lighting. Playful but intimate interaction.',
    thumbnail: '',
    icon: <Ghost className="w-6 h-6" />,
  },
  {
    id: 'new-year',
    name: 'Tahun Baru (New Year)',
    description: 'Glamor dan elegan menyambut tahun baru.',
    promptModifier: 'A glamorous New Year\'s Eve celebration. The human is holding the pet close to their chest. Human wears formal party attire (suit/gown). Background filled with golden fireworks and bokeh lights. Gold and black color palette, elegant, festive, intimate high-end photography.',
    thumbnail: '',
    icon: <CalendarDays className="w-6 h-6" />,
  },
  {
    id: 'valentine',
    name: 'Valentine (Kasih Sayang)',
    description: 'Romantis dengan bunga dan warna pink.',
    promptModifier: 'A sweet Valentine\'s Day theme. The human is cuddling the pet, cheek to cheek with eyes closed or smiling. Surrounded by pink and red roses, heart-shaped balloons, and soft dreamy lighting. Romantic and cute atmosphere, pastel colors, very soft focus background.',
    thumbnail: '',
    icon: <HeartHandshake className="w-6 h-6" />,
  },
  {
    id: 'eid-mubarak',
    name: 'Idul Fitri / Ramadan',
    description: 'Suasana lebaran yang suci dan hangat.',
    promptModifier: 'A respectful and elegant Eid Mubarak / Ramadan family portrait. Human subjects wearing modest fashion (Baju Koko/Kaftan), sitting on a rug with the pet sitting calmly on their lap or being held gently. Background of Islamic geometric patterns or a warm home setting with lanterns. Peaceful, family warmth.',
    thumbnail: '',
    icon: <Moon className="w-6 h-6" />,
  },
  {
    id: 'picnic',
    name: 'Piknik Taman',
    description: 'Santai di rumput dengan cahaya matahari.',
    promptModifier: 'A bright outdoor picnic scene. The human is lying on a picnic blanket on the grass, hugging the pet or having the pet rest on their chest. Sunlight filtering through trees, green grass, lens flare. Natural lighting, candid and happy vibe.',
    thumbnail: '',
    icon: <Flower className="w-6 h-6" />,
  },
  {
    id: 'wedding-guest',
    name: 'Pesta Pernikahan',
    description: 'Tamu kehormatan yang elegan.',
    promptModifier: 'A formal wedding photography style. The human is dressed formally (suit or dress) and is holding the pet like a precious companion. White floral arrangements, soft romantic lighting, bokeh garden background. Classy, sophisticated, and intimate.',
    thumbnail: '',
    icon: <Gift className="w-6 h-6" />,
  },
];

export const CREATIVE_THEMES: Theme[] = [
  { id: 'royal', name: 'Bangsawan Kerajaan', description: 'Lukisan minyak gaya renaisans yang megah.', promptModifier: 'An oil painting of the subjects dressed in ornate royal robes (kings/queens), wearing jeweled crowns, sitting on a velvet throne, dramatic rembrandt lighting, classical art style.', thumbnail: '', icon: <Crown /> },
  { id: 'astronaut', name: 'Penjelajah Angkasa', description: 'Astronot berani yang menjelajahi kosmos.', promptModifier: 'Cinematic photorealistic image of the subjects wearing detailed NASA space suits, floating in outer space with earth in background, helmet visor reflections, 8k resolution.', thumbnail: '', icon: <Rocket /> },
  { id: 'steampunk', name: 'Penemu Steampunk', description: 'Roda gigi kuningan, kacamata goggle, dan estetika victoria.', promptModifier: 'Steampunk style, brass gears, leather goggles, victorian clothing, steam engine background.', thumbnail: '', icon: <Compass /> },
  { id: 'pop-art', name: 'Pop Art', description: 'Gaya Andy Warhol yang cerah.', promptModifier: 'Pop art style, vibrant colors, halftone dots, comic book aesthetic, Andy Warhol influence.', thumbnail: '', icon: <Star /> },
  { id: 'fantasy-rpg', name: 'Pahlawan Fantasi RPG', description: 'Armor abad pertengahan dan sihir.', promptModifier: 'High fantasy digital painting, wearing medieval armor, magical aura, epic fantasy background, D&D character style.', thumbnail: '', icon: <Gem /> },
  { id: 'noir', name: 'Film Noir', description: 'Gaya detektif hitam putih yang dramatis.', promptModifier: 'Black and white film noir photography, dramatic shadows, venetian blind lighting, detective aesthetic, rainy window.', thumbnail: '', icon: <Eye /> },
  { id: 'watercolor', name: 'Cat Air Lembut', description: 'Lukisan cat air yang artistik dan seperti mimpi.', promptModifier: 'Soft watercolor painting, pastel colors, artistic splashes, paper texture, dreamy atmosphere.', thumbnail: '', icon: <Palette /> },
  { id: 'gta-style', name: 'Layar Loading GTA', description: 'Gaya seni vektor yang ikonik.', promptModifier: 'GTA loading screen art style, vector illustration, bold outlines, cel shading, sunset background.', thumbnail: '', icon: <CarIcon /> },
  { id: 'pixar', name: 'Animasi 3D', description: 'Karakter film animasi yang lucu.', promptModifier: '3D Pixar style render, big expressive eyes, soft lighting, smooth textures, adorable animation style.', thumbnail: '', icon: <Sparkles /> },
  { id: 'cyberpunk', name: 'Neon Cyberpunk', description: 'Nuansa sci-fi masa depan dengan lampu neon.', promptModifier: 'Futuristic cyberpunk digital art, subjects wearing high-tech gear/cybernetics, neon pink and blue city lights background, rain-slicked streets, blade runner aesthetic.', thumbnail: '', icon: <Zap /> },
  { id: 'origami', name: 'Origami Kertas', description: 'Terbuat sepenuhnya dari lipatan kertas.', promptModifier: 'Surreal origami style, subjects made of folded paper, intricate paper textures, soft studio lighting.', thumbnail: '', icon: <Feather /> },
  { id: 'vaporwave', name: 'Vaporwave', description: 'Estetika 90an dengan patung dan glitch.', promptModifier: 'Vaporwave aesthetic, pink and blue gradients, greek statues, retro computer graphics, glitch effects.', thumbnail: '', icon: <Music /> },
  { id: 'gothic', name: 'Misteri Gotik', description: 'Gelap, murung, dan bergaya victoria.', promptModifier: 'Gothic aesthetic, dark moody atmosphere, victorian mansion background, fog, candlelight.', thumbnail: '', icon: <Flame /> },
  { id: 'pencil', name: 'Sketsa Pensil', description: 'Sketsa grafit buatan tangan.', promptModifier: 'Detailed graphite pencil sketch, rough shading, white paper background, hand-drawn artistic style.', thumbnail: '', icon: <User /> },
  { id: 'ukiyo-e', name: 'Ukiyo-e Jepang', description: 'Cetakan balok kayu tradisional Jepang.', promptModifier: 'Ukiyo-e woodblock print style, great wave background, traditional japanese clothing, flat colors, outlines.', thumbnail: '', icon: <Anchor /> },
  { id: 'lego', name: 'Balok Plastik', description: 'Dibangun dari mainan balok.', promptModifier: 'Made specifically of plastic toy bricks, macro photography, depth of field, playful.', thumbnail: '', icon: <Cpu /> },
  { id: 'mosaic', name: 'Mosaik Kuno', description: 'Terbuat dari ubin berwarna.', promptModifier: 'Ancient roman mosaic style, made of small colored stone tiles, texture, historic feel.', thumbnail: '', icon: <Gem /> },
  { id: 'stained-glass', name: 'Kaca Patri', description: 'Gaya jendela gereja yang penuh warna.', promptModifier: 'Stained glass window design, vibrant translucent colors, black lead outlines, light shining through.', thumbnail: '', icon: <Lightbulb /> },
  { id: 'claymation', name: 'Claymation', description: 'Gaya stop-motion plastisin.', promptModifier: 'Claymation style, plasticine texture, thumbprints visible, stop-motion aesthetic, soft lighting.', thumbnail: '', icon: <User /> },
  { id: 'retro-80s', name: 'Synthwave 80an', description: 'Matahari terbenam retro dan garis grid.', promptModifier: '80s synthwave style, retro sunset, grid landscape, chrome text effects, laser beams.', thumbnail: '', icon: <Music /> },
  { id: 'oil-impasto', name: 'Impasto Tebal', description: 'Cat minyak tebal dan bertekstur.', promptModifier: 'Heavy impasto oil painting, thick palette knife texture, vibrant colors, abstract background touches.', thumbnail: '', icon: <Palette /> },
  { id: 'street-art', name: 'Seni Jalanan Graffiti', description: 'Gaya cat semprot perkotaan.', promptModifier: 'Urban graffiti street art, spray paint texture, vibrant colors, brick wall background.', thumbnail: '', icon: <Zap /> },
];

// Helper for icons not imported
function CarIcon(props: any) { return <div {...props}>🚗</div> }