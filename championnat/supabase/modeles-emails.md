# Les emails de MULTIPLEX, en français

À coller dans le tableau de bord Supabase, projet **multiplex** → **Authentication → Emails → Templates**.
Pour chaque modèle : remplacer le **Subject** et le **Message body** (onglet Source), puis **Save**.
`{{ .ConfirmationURL }}` est remplacé par Supabase par le vrai lien : ne pas y toucher.

## Confirm signup (confirmation d'inscription)

**Subject** : `Confirmez votre compte MULTIPLEX`

```html
<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;color:#16243c">
  <h2 style="margin:0 0 12px">📻 MULTIPLEX</h2>
  <p>Bienvenue sur le banc.</p>
  <p>Un clic pour confirmer votre adresse, et vos carrières vous suivront sur tous vos appareils :</p>
  <p style="margin:22px 0">
    <a href="{{ .ConfirmationURL }}" style="background:#ffd24a;color:#0b1626;padding:12px 20px;border-radius:4px;text-decoration:none;font-weight:bold">Confirmer mon compte</a>
  </p>
  <p style="color:#7e96b5;font-size:13px">Vous n'avez rien demandé ? Ignorez cet email, rien ne sera créé.</p>
</div>
```

## Reset password (mot de passe oublié)

**Subject** : `Votre nouveau mot de passe MULTIPLEX`

```html
<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;color:#16243c">
  <h2 style="margin:0 0 12px">📻 MULTIPLEX</h2>
  <p>Vous avez demandé à changer de mot de passe. Le lien ci-dessous vous ramène au jeu pour en choisir un nouveau :</p>
  <p style="margin:22px 0">
    <a href="{{ .ConfirmationURL }}" style="background:#ffd24a;color:#0b1626;padding:12px 20px;border-radius:4px;text-decoration:none;font-weight:bold">Choisir un nouveau mot de passe</a>
  </p>
  <p style="color:#7e96b5;font-size:13px">Ce n'était pas vous ? Ignorez cet email : votre mot de passe ne change pas.</p>
</div>
```
