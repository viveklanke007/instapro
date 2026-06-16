export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatar: string;
  coverBanner: string;
  bio: string;
  website: string;
  followers: string[]; // User IDs
  following: string[]; // User IDs
  verified: boolean;
  private: boolean;
  reputation: number; // 0-100
  achievements: string[]; // Badges: "Rising Creator", "Top Commenter", "Viral Post", "Verified Creator"
  reelsViewsCount: number;
  profileVisitsCount: number;
  referrals: number;
  language: "en" | "es" | "fr" | "de";
  isBlocked?: boolean;
}

export interface Post {
  id: string;
  userId: string;
  media: string[]; // URLs or base64 strings
  mediaType: "image" | "video" | "carousel" | "voice";
  caption: string;
  hashtags: string[];
  mentions: string[];
  location: string;
  mood?: "Happy" | "Sad" | "Excited" | "Motivated" | "Chill";
  voiceUrl?: string; // For voice note posts
  likes: string[]; // User IDs
  isConfession?: boolean; // For anonymous confession section
  isDraft?: boolean;
  scheduledFor?: string; // ISO Date String
  createdAt: string;
  communityId?: string; // Topic Room ID if posted to a room
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
  likes: string[]; // User IDs
  pinned: boolean;
  parentId?: string; // Nested reply reference
}

export interface Story {
  id: string;
  userId: string;
  media: string;
  mediaType: "image" | "video";
  createdAt: string;
  expiresAt: string;
  views: string[]; // User IDs
  reactions: { userId: string; emoji: string }[];
}

export interface Reel {
  id: string;
  userId: string;
  videoUrl: string;
  caption: string;
  likes: string[];
  sharesCount: number;
  viewsCount: number;
  hashtags: string[];
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  media?: string;
  mediaType?: "image" | "video" | "voice";
  reactions: { userId: string; emoji: string }[];
  seen: boolean;
  createdAt: string;
}

export interface CommunityRoom {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  memberCount: number;
}

export interface Notification {
  id: string;
  type: "like" | "comment" | "follow" | "mention" | "message" | "reel_engagement" | "achievement";
  senderId?: string;
  receiverId: string;
  postId?: string;
  reelId?: string;
  message?: string;
  createdAt: string;
  read: boolean;
}

// Translations map for Multi Language Support
export const TRANSLATIONS = {
  en: {
    home: "Home",
    search: "Search",
    reels: "Reels",
    messages: "Messages",
    notifications: "Notifications",
    communities: "Rooms",
    profile: "Profile",
    admin: "Admin",
    create: "Create",
    anonymousConfessions: "Confessions",
    followers: "followers",
    following: "following",
    mood: "Mood",
    voiceNotes: "Voice Notes",
    trending: "Trending",
    aiTools: "AI Assistant",
    verifyEmail: "Verify Email",
    forgotPass: "Forgot Password",
    changePass: "Change Password",
    verifiedBadge: "Verified",
    reputationScore: "Reputation Score",
    inviteFriends: "Invite Friends",
    saveDraft: "Save Draft",
    schedulePost: "Schedule Post",
    allPosts: "All Posts",
    writeComment: "Add a comment...",
    nestedComments: "Replies",
    roomTitle: "Community Rooms"
  },
  es: {
    home: "Inicio",
    search: "Buscar",
    reels: "Reels",
    messages: "Mensajes",
    notifications: "Notificaciones",
    communities: "Salas",
    profile: "Perfil",
    admin: "Admin",
    create: "Crear",
    anonymousConfessions: "Confesiones",
    followers: "seguidores",
    following: "siguiendo",
    mood: "Estado de ánimo",
    voiceNotes: "Notas de voz",
    trending: "Tendencias",
    aiTools: "Asistente IA",
    verifyEmail: "Verificar correo",
    forgotPass: "Contraseña olvidada",
    changePass: "Cambiar contraseña",
    verifiedBadge: "Verificado",
    reputationScore: "Reputación",
    inviteFriends: "Invitar amigos",
    saveDraft: "Guardar borrador",
    schedulePost: "Programar publicación",
    allPosts: "Todas las publicaciones",
    writeComment: "Añadir un comentario...",
    nestedComments: "Respuestas",
    roomTitle: "Salas de la comunidad"
  },
  fr: {
    home: "Accueil",
    search: "Recherche",
    reels: "Reels",
    messages: "Messages",
    notifications: "Notifications",
    communities: "Salles",
    profile: "Profil",
    admin: "Admin",
    create: "Créer",
    anonymousConfessions: "Confessions",
    followers: "abonnés",
    following: "abonnements",
    mood: "Humeur",
    voiceNotes: "Notes vocales",
    trending: "Tendances",
    aiTools: "Assistant IA",
    verifyEmail: "Vérifier l'e-mail",
    forgotPass: "Mot de passe oublié",
    changePass: "Modifier le mot de passe",
    verifiedBadge: "Vérifié",
    reputationScore: "Réputation",
    inviteFriends: "Inviter des amis",
    saveDraft: "Sauvegarder brouillon",
    schedulePost: "Planifier publication",
    allPosts: "Toutes les publications",
    writeComment: "Ajouter un commentaire...",
    nestedComments: "Réponses",
    roomTitle: "Espaces Communautés"
  },
  de: {
    home: "Startseite",
    search: "Suche",
    reels: "Reels",
    messages: "Direktnachrichten",
    notifications: "Mitteilungen",
    communities: "Räume",
    profile: "Profil",
    admin: "Admin",
    create: "Erstellen",
    anonymousConfessions: "Beichten",
    followers: "Follower",
    following: "Folge ich",
    mood: "Stimmung",
    voiceNotes: "Sprachnotizen",
    trending: "Trends",
    aiTools: "KI Helfer",
    verifyEmail: "E-Mail verifizieren",
    forgotPass: "Passwort vergessen",
    changePass: "Passwort ändern",
    verifiedBadge: "Verifiziert",
    reputationScore: "Reputation",
    inviteFriends: "Freunde einladen",
    saveDraft: "Entwurf speichern",
    schedulePost: "Beitrag planen",
    allPosts: "Alle Beiträge",
    writeComment: "Kommentar schreiben...",
    nestedComments: "Antworten",
    roomTitle: "Themen-Räume"
  }
};
