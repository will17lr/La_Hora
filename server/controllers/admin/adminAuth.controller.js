// server/controllers/admin/adminAuth.controller.js
const User = require('../../models/user');
const bcrypt = require('bcrypt');

const norm = (s='') => s.trim().toLowerCase();

exports.showLogin = (req, res) => {
  res.render('admin/login', { title:'Connexion admin', error:null, next:req.query.next||'', emailTyped:'' });
};

exports.login = async (req, res) => {
  try {
    const { email='', password='' } = req.body || {};
    const user = await User.findOne({ email: norm(email), isActive: true }).select('+password roles emailVerified');
    if (!user || !user.isAdminLike || !user.isAdminLike()) {
      return res.status(401).render('admin/login', { error:'Identifiants invalides', emailTyped: email, next:req.body?.next||'' });
    }
    const ok = await user.comparePassword(password);
    if (!ok) {
      return res.status(401).render('admin/login', { error:'Identifiants invalides', emailTyped: email, next:req.body?.next||'' });
    }
    req.session.user = { id:user._id, email:user.email, roles:user.roles };
    req.flash?.('success','Connexion réussie.');
    return res.redirect(req.body?.next || '/admin');
  } catch (e) {
    console.error('[ADMIN LOGIN]', e);
    return res.status(500).render('admin/login', { error:'Erreur serveur', next:'', emailTyped:'' });
  }
};

/* ➜ AJOUTER CES DEUX HANDLERS */
exports.showRegister = (req, res) => {
  res.render('admin/register', { title:'Inscription admin', error:null, values:{} });
};

exports.register = async (req, res) => {
  try {
    const { email='', password='', confirm='', invite='' } = req.body || {};

    if (!invite || invite !== process.env.ADMIN_SIGNUP_CODE) {
      return res.status(401).render('admin/register', { error:'Code d’invitation invalide.', values:{ email } });
    }
    const emailNorm = norm(email);
    if (!emailNorm) return res.status(400).render('admin/register', { error:'Email requis.', values:{ email } });
    if (!password || password.length < 8) return res.status(400).render('admin/register', { error:'Mot de passe trop court (min 8).', values:{ email } });
    if (password !== confirm) return res.status(400).render('admin/register', { error:'Les mots de passe ne correspondent pas.', values:{ email } });

    const exists = await User.findOne({ email: emailNorm }).lean();
    if (exists) return res.status(409).render('admin/register', { error:'Un compte existe déjà avec cet email.', values:{ email } });

    // si ton modèle n’a pas de pre-save hash, on hash ici :
    const hash = await bcrypt.hash(password, 12);
    const user = await User.create({
      email: emailNorm,
      password: hash,          // -> mets "password" si tu as un pre-save qui hash
      roles: ['admin'],
      isActive: true,
      emailVerified: true
    });

    req.session.user = { id:user._id, email:user.email, roles:user.roles };
    req.flash?.('success','Compte créé.');
    return res.redirect('/admin');
  } catch (e) {
    console.error('[ADMIN REGISTER]', e);
    return res.status(500).render('admin/register', { error:'Erreur serveur.', values:{} });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/admin/login'));
};
