import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
const prisma = new PrismaClient()
async function main(){
  console.log('🌱 ClipMaster Pro v1.1 seed ...')
  await prisma.postJob.deleteMany()
  await prisma.approval.deleteMany()
  await prisma.export.deleteMany()
  await prisma.socialAccount.deleteMany()
  await prisma.clip.deleteMany()
  await prisma.moment.deleteMany()
  await prisma.video.deleteMany()
  await prisma.project.deleteMany()
  await prisma.teamMember.deleteMany()
  await prisma.team.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  const pass = await bcrypt.hash('demo123',10)
  const rian = await prisma.user.create({ data:{ id:'user_demo_rian', email:'demo@clipmaster.id', name:'Rian Clipper', passwordHash:pass, plan:'Pro', role:'OWNER'}})
  const editor = await prisma.user.create({ data:{ email:'editor@clipmaster.id', name:'Dina Editor', passwordHash:pass, plan:'Team', role:'EDITOR'}})
  const reviewer = await prisma.user.create({ data:{ email:'reviewer@clipmaster.id', name:'Arif Reviewer', passwordHash:pass, plan:'Team', role:'REVIEWER'}})

  const team = await prisma.team.create({ data:{ name:'ClipMaster ID Team', slug:'clipmaster-id-team', ownerId: rian.id, seats:5 }})
  await prisma.teamMember.createMany({ data:[
    { teamId: team.id, userId: rian.id, role:'OWNER', acceptedAt: new Date() },
    { teamId: team.id, userId: editor.id, role:'EDITOR', acceptedAt: new Date() },
    { teamId: team.id, userId: reviewer.id, role:'REVIEWER', acceptedAt: new Date() },
  ]})

  // import original seed quickly (reuse v1 data)
  // ... simplified: run original seed then attach team
  console.log('Run: npm run db:seed   # v1 base')
  console.log('Then team + social accounts seeded.')
  // social accounts
  await prisma.socialAccount.createMany({ data:[
    { userId: rian.id, provider:'tiktok', handle:'@clipmasterid', active:true },
    { userId: rian.id, provider:'youtube', handle:'ClipMaster Shorts', active:true },
    { userId: rian.id, provider:'instagram', handle:'@clipmaster.id', active:true },
  ]})
  console.log('✅ v1.1 Team + Social ready')
}
main().finally(()=>prisma.$disconnect())
