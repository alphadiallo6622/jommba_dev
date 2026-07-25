// lib/photo-messages.ts
// Messages partagés entre le rejet de photo (admin), le rappel dashboard et le
// cron email, pour garder un texte cohérent partout.

/** Affiché quand une photo a été rejetée par la modération. */
export const PHOTO_REJECTED_MESSAGE =
  "Votre photo de profil n'est pas conforme et ne respecte pas les règles de la communauté. " +
  "Elle a été retirée. Veuillez ajouter une nouvelle photo dans vos paramètres — " +
  "sans photo de profil, votre profil n'est pas visible par les autres membres."

/** Rappel périodique (email + popup) tant qu'aucune photo n'est présente. */
export const PHOTO_REMINDER_MESSAGE =
  "Votre profil n'a pas encore de photo de profil : il n'est donc pas visible par les autres membres. " +
  "Ajoutez une photo dans vos paramètres pour rendre votre profil visible et augmenter vos chances de rencontre."

export const PHOTO_REMINDER_SUBJECT = "Ajoutez une photo pour rendre votre profil visible";
