# AI Workflow - Quick Start Checklist

**Time**: 2-3 hours | **Cost**: ~$126-206/month

---

## ✅ Setup Checklist

### 1. Accounts (30 min)
- [ ] Create Speckit account → [speckit.org](https://speckit.org/)
- [ ] Upgrade Figma to Professional ($12/mo) → [figma.com](https://figma.com/)
- [ ] Sign up for v0 Pro ($20/mo) → [v0.dev](https://v0.dev/)
- [ ] Sign up for Anima Pro ($31/mo) → [animaapp.com](https://animaapp.com/)
- [ ] Upgrade Claude Code to Pro ($20/mo)
- [ ] Install Codium PR-Agent ($19/mo) → [github.com/apps/pr-agent](https://github.com/apps/pr-agent)
- [ ] GitHub Team plan ($4/user)

### 2. Figma Setup (20 min)
- [ ] Install AI plugins: Builder.io, Genius, Magician
- [ ] Install Anima plugin
- [ ] Create design system file (optional)
- [ ] Test AI plugin with sample prompt

### 3. v0 Setup (10 min)
- [ ] Sign in with GitHub
- [ ] Test: Generate sample Next.js component
- [ ] Verify: Can copy code

### 4. Claude Code Setup (30 min)
- [ ] Install: `npm install -g @anthropic-ai/claude-code`
- [ ] Copy CLAUDE.md to your project
- [ ] Copy docs/ folder to your project
- [ ] Customize placeholders in CLAUDE.md
- [ ] Test: `claude` in your project directory

### 5. GitHub Setup (40 min)
- [ ] Create repository (if needed)
- [ ] Install Codium PR-Agent app
- [ ] Configure branch protection (dev, sit, uat, prod)
- [ ] Create `.github/workflows/ci.yml`
- [ ] Test: Create test PR, verify checks run

### 6. Test Workflow (30 min)
- [ ] Plan simple feature in Speckit
- [ ] Design in Figma with AI
- [ ] Approve designs ✅
- [ ] Convert to code with v0
- [ ] Hand off to Claude Code
- [ ] Review and merge PR ✅
- [ ] Verify deployment

---

## 📋 Daily Workflow

### For Each New Feature:

1. **Plan** (Speckit - 2-4 hrs)
   - Write spec with user stories
   - Define acceptance criteria
   - Create Figma prompt

2. **Design** (Figma - 2-4 hrs)
   - Generate UI with AI plugin
   - Refine designs
   - **Approve** ✅

3. **Convert** (v0/Anima - 30 min)
   - Copy design to v0
   - Export component code

4. **Implement** (Claude Code - 2-8 hrs)
   - Provide handoff package
   - Review plan
   - Let Claude implement
   - PR created automatically

5. **Review** (1-2 hrs)
   - Check CI passes
   - Review AI comments
   - Test manually
   - **Approve & merge** ✅

6. **Deploy** (Automatic)
   - DEV → SIT → UAT → PROD

---

## 🚨 Critical Rules

### Every Implementation Must Have

**Backend**: API Versioning
- ✅ ALL endpoints use `/api/v1/` prefix
- ❌ NO unversioned endpoints

**Frontend**: Responsive Design
- ✅ Works on mobile (< 640px)
- ✅ Works on tablet (640-1024px)
- ✅ Works on desktop (> 1024px)
- ❌ NO fixed-width layouts

### Before Design Conversion
✋ **STOP** - Review and approve all Figma designs
- Verify all 3 breakpoints designed (mobile, tablet, desktop)

### Before Merging
✋ **STOP** - Manual approval required
- All checks must be green
- AI review comments addressed
- Manual testing complete
- **API versioning verified**
- **Responsive design tested**
- You click the merge button

### Build Order
Must run in this order:
1. Build/Compile ← FIRST
2. Lint
3. Type-check
4. Tests
5. Format check

---

## 💰 Monthly Costs

| Tool | Cost |
|------|------|
| Speckit | TBD |
| Figma Pro | $12 |
| v0 Pro | $20 |
| Anima Pro | $31 |
| Claude Code Pro | $20 |
| Codium PR-Agent | $19 |
| GitHub Team | $4 |
| Railway/Vercel | $20-100 |
| **Total** | **$126-206** |

---

## 📚 Documentation Reference

- **Full Workflow**: `docs/project-rules/ai-development-workflow.md`
- **Setup Guide**: `docs/setup-guides/ai-workflow-setup.md`
- **Summary**: `AI-WORKFLOW-SUMMARY.md`
- **This Checklist**: `QUICK-START.md`

---

## 🆘 Troubleshooting

**Claude can't find docs**
→ Ensure CLAUDE.md is in project root

**CI failing but works locally**
→ Check Node version, clear cache

**AI not reviewing PRs**
→ Check Codium app permissions

**Build failing**
→ Run build BEFORE linting

**More help**: See `docs/setup-guides/ai-workflow-setup.md` troubleshooting section

---

## ✨ Success Metrics

You'll know it's working when:
- ✅ Idea to production < 1 week
- ✅ 0 lint errors (enforced)
- ✅ 80%+ test coverage
- ✅ Shipping faster than before
- ✅ High code quality maintained

---

## 🎯 Next Steps

1. ☐ Complete setup checklist above
2. ☐ Test with simple feature
3. ☐ Read full workflow docs
4. ☐ Train team on process
5. ☐ Start building! 🚀

---

**Need detailed instructions?** → `docs/setup-guides/ai-workflow-setup.md`

**Questions about workflow?** → `docs/project-rules/ai-development-workflow.md`

**Ready to customize?** → Update CLAUDE.md placeholders
