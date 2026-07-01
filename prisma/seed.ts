import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
const prisma = new PrismaClient()

async function main(){
  console.log('🌱 ClipMaster Pro v1.1 — Full Stack Seed')

  // clear in FK order
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

  const pass = await bcrypt.hash('demo123', 10)

  const rian = await prisma.user.create({
    data: {
      id: 'user_demo_rian',
      email: 'demo@clipmaster.id',
      name: 'Rian Clipper',
      passwordHash: pass,
      plan: 'Pro',
      role: 'OWNER'
    }
  })
  const editor = await prisma.user.create({
    data: {
      email: 'editor@clipmaster.id',
      name: 'Dina Editor',
      passwordHash: pass,
      plan: 'Team',
      role: 'EDITOR'
    }
  })
  const reviewer = await prisma.user.create({
    data: {
      email: 'reviewer@clipmaster.id',
      name: 'Arif Reviewer',
      passwordHash: pass,
      plan: 'Team',
      role: 'REVIEWER'
    }
  })

  const team = await prisma.team.create({
    data: {
      name: 'ClipMaster ID Team',
      slug: 'clipmaster-id-team',
      ownerId: rian.id,
      seats: 5
    }
  })
  await prisma.teamMember.createMany({
    data: [
      { teamId: team.id, userId: rian.id, role: 'OWNER', acceptedAt: new Date() },
      { teamId: team.id, userId: editor.id, role: 'EDITOR', acceptedAt: new Date() },
      { teamId: team.id, userId: reviewer.id, role: 'REVIEWER', acceptedAt: new Date() },
    ]
  })

  const project1 = await prisma.project.create({
    data: {
      name: 'Windah Basudara Clips',
      slug: 'windah-basudara',
      channelName: 'Windah Basudara',
      description: 'Auto clip stream horror & gaming',
      color: '#FF3B5C',
      userId: rian.id,
      teamId: team.id
    }
  })
  const project2 = await prisma.project.create({
    data: {
      name: 'Deddy Corbuzier Podcast',
      slug: 'deddy-podcast',
      channelName: 'Close The Door',
      description: 'Podcast highlights 60 detik',
      color: '#8B5CF6',
      userId: rian.id,
      teamId: team.id
    }
  })

  const videosData = [
    { youtubeId:'L_jWHffIx5E', title:'24 JAM MAIN GAME HORROR PALING SERAM!! - Windah Basudara', channel:'Windah Basudara', duration:8742, views:3401200, url:'https://youtube.com/watch?v=L_jWHffIx5E', tags:'horror,gaming,windah,live', projectId: project1.id },
    { youtubeId:'3tmd-ClpJxA', title:'MUKBANG 100 CHICKEN NUGGETS ft. Tanboy Kun', channel:'Tanboy Kun', duration:1240, views:5210400, url:'https://youtube.com/watch?v=3tmd-ClpJxA', tags:'mukbang,food,viral', projectId: null },
    { youtubeId:'kJQP7kiw5Fk', title:'CLOSE THE DOOR - CEO MIXUE TERBONGKAR RAHASIA BISNIS', channel:'Deddy Corbuzier', duration:4520, views:8129000, url:'https://youtube.com/watch?v=kJQP7kiw5Fk', tags:'podcast,bisnis,deddy', projectId: project2.id },
    { youtubeId:'9bZkp7q19f0', title:'Podcast Reza Arap - Bangkrut sampai Bangkit Lagi', channel:'Arap Clips ID', duration:3890, views:2103400, url:'https://youtube.com/watch?v=9bZkp7q19f0', tags:'podcast,arap,motivasi', projectId: project2.id },
    { youtubeId:'jNQXAC9IVRw', title:'Review Jujur - iPhone 15 Pro Max 3 Bulan Pemakaian', channel:'GadgetIn', duration:1124, views:1623300, url:'https://youtube.com/watch?v=jNQXAC9IVRw', tags:'gadget,review,iphone', projectId: null },
    { youtubeId:'dQw4w9WgXcQ', title:'BONGKAR GAJI YOUTUBER INDONESIA 2025', channel:'Ferry Irwandi Clips', duration:2150, views:980442, url:'https://youtube.com/watch?v=dQw4w9WgXcQ', tags:'edukasi,youtube,uang', projectId: null },
  ]

  const videos = []
  for(const v of videosData){
    const created = await prisma.video.create({
      data: {
        ...v,
        thumbnail: `https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`,
        userId: rian.id,
        status: 'READY',
        language: 'id'
      }
    })
    videos.push(created)
  }

  const momentsSeed = [
    { videoIdx:0, startSec:482, label:'JUMPSCARE GILA!!', score:96.4, emotion:'SHOCK', reason:'Reaksi teriak + spike audio' },
    { videoIdx:0, startSec:1294, label:'Brando Panik Bocil', score:92.1, emotion:'FUNNY', reason:'Dialog lucu spontan' },
    { videoIdx:0, startSec:3420, label:'Moment iconic “Jangan lah bang”', score:94.7, emotion:'FUNNY', reason:'High retention quote' },
    { videoIdx:2, startSec:740, label:'Rahasia Harga Mixue 8rb', score:95.2, emotion:'HIGH', reason:'Insight bisnis kuat' },
    { videoIdx:2, startSec:1840, label:'Deddy Kaget Omset', score:91.5, emotion:'SHOCK', reason:'Reveal angka' },
    { videoIdx:1, startSec:210, label:'Tanboy Kun 50 nugget nonstop', score:89.3, emotion:'HIGH', reason:'Visual satisfying' },
  ]
  for(const m of momentsSeed){
    await prisma.moment.create({
      data: {
        videoId: videos[m.videoIdx].id,
        startSec: m.startSec,
        endSec: m.startSec+60,
        label: m.label,
        score: m.score,
        emotion: m.emotion,
        reason: m.reason,
        keywords: 'viral,hook,retention'
      }
    })
  }

  const clipsSeed = [
    { videoIdx:0, title:'BRANDO JUMPSCARE PALING KERAS 2025 😱', startSec:482, score:96.4, platform:'tiktok', status:'READY', views:842000, likes:61200, hookText:'Detik ke 7 BIKIN KAGET', tags:'windah,horror,jumpscare,viral' },
    { videoIdx:0, title:'“JANGAN LAH BANG” - Moment Legendaris', startSec:3420, score:94.7, platform:'reels', status:'POSTED', views:1204000, likes:94000, hookText:'Yang tau tau aja', tags:'windah,meme,lucu' },
    { videoIdx:2, title:'Rahasia Mixue Bisa Jual 8000 - CEO Spill', startSec:740, score:95.2, platform:'shorts', status:'READY', views:560000, likes:32100, hookText:'INI STRATEGI GILANYA', tags:'bisnis,mixue,deddy,podcast' },
    { videoIdx:2, title:'Deddy SYOK dengar Omset Mixue /hari', startSec:1840, score:91.5, platform:'tiktok', status:'EXPORTED', views:312000, likes:18400, hookText:'Angkanya gak masuk akal', tags:'deddy,bisnis' },
    { videoIdx:1, title:'Tanboy Kun HABIS 50 Nugget 3 Menit', startSec:210, score:89.3, platform:'shorts', status:'DRAFT', views:0, likes:0, hookText:'Mukbang tercepat', tags:'mukbang,tanboykun' },
    { videoIdx:3, title:'Reza Arap: “Gue pernah minus 7M”', startSec:420, score:93.1, platform:'reels', status:'READY', views:194000, likes:15600, hookText:'Cerita bangkrut Arap', tags:'arap,podcast,motivasi' },
    { videoIdx:4, title:'iPhone 15 Panas? Jujur 3 Bulan Pakai', startSec:180, score:87.8, platform:'tiktok', status:'READY', views:88000, likes:4200, hookText:'Jangan beli dulu sebelum nonton', tags:'gadget,iphone,review' },
    { videoIdx:5, title:'Gaji Youtuber 1 Juta Subs Berapa?', startSec:95, score:90.4, platform:'shorts', status:'POSTED', views:445000, likes:28100, hookText:'Dibocorin Ferry', tags:'youtube,uang,edukasi' },
    { videoIdx:0, title:'Brando Ngamuk Bocil Toxic Donate', startSec:1294, score:92.1, platform:'tiktok', status:'DRAFT', views:0, likes:0, hookText:'LIVE DRAMA', tags:'windah,drama' },
    { videoIdx:3, title:'Tips Arap Bangkit dari 0', startSec:980, score:88.6, platform:'reels', status:'READY', views:72000, likes:5900, hookText:'3 hal ini wajib', tags:'motivasi' },
    { videoIdx:4, title:'Kamera iPhone vs Android 15jt?', startSec:560, score:85.2, platform:'shorts', status:'DRAFT', views:0, likes:0, hookText:'Hasilnya ngejutin', tags:'gadget' },
    { videoIdx:5, title:'CPM Indonesia Naik 2025 ???', startSec:620, score:86.9, platform:'tiktok', status:'READY', views:54000, likes:3100, hookText:'Kabar bagus buat creator', tags:'youtube,creator' },
  ]

  const createdClips = []
  for(const c of clipsSeed){
    const vid = videos[c.videoIdx]
    const clip = await prisma.clip.create({
      data: {
        title: c.title,
        startSec: c.startSec,
        endSec: c.startSec+60,
        duration: 60,
        score: c.score,
        platform: c.platform,
        status: c.status,
        views: c.views,
        likes: c.likes,
        hookText: c.hookText,
        tags: c.tags,
        videoId: vid.id,
        userId: rian.id,
        projectId: vid.projectId,
        description: `Auto clip AI - ${c.hookText}`,
        aspect: '9:16'
      }
    })
    createdClips.push(clip)
  }

  // social accounts
  await prisma.socialAccount.createMany({
    data: [
      { userId: rian.id, provider:'tiktok', handle:'@clipmasterid', active:true },
      { userId: rian.id, provider:'youtube', handle:'ClipMaster Shorts', active:true },
      { userId: rian.id, provider:'instagram', handle:'@clipmaster.id', active:true },
    ]
  })

  // sample export (done)
  await prisma.export.create({
    data: {
      clipId: createdClips[3].id,
      platform: 'tiktok',
      status: 'DONE',
      progress: 100,
      outputUrl: 'https://cdn.clipmaster.id/renders/sample-deddy-mixue.mp4',
      fileSize: 9821440,
      resolution: '1080x1920'
    }
  })

  // sample approval
  await prisma.approval.create({
    data: {
      clipId: createdClips[0].id,
      reviewerId: reviewer.id,
      status: 'APPROVED',
      note: 'Hook kuat, audio clean, go publish jam 19:30',
      timecodes: '0:07 jumpscare keep'
    }
  })

  // sample post job
  const social = await prisma.socialAccount.findFirst({ where:{ userId: rian.id, provider:'tiktok' }})
  if(social){
    await prisma.postJob.create({
      data: {
        clipId: createdClips[1].id,
        userId: rian.id,
        socialAccountId: social.id,
        provider: 'tiktok',
        caption: 'Jangan lah bang 😂 #windah #fyp #viral',
        hashtags: '#fyp #viral #windahbasudara',
        status: 'POSTED',
        externalId: '738291918273',
        externalUrl: 'https://www.tiktok.com/@clipmasterid/video/738291918273',
        postedAt: new Date()
      }
    })
  }

  console.log(`✅ ClipMaster Pro v1.1 seeded:
  - Owner: demo@clipmaster.id / demo123
  - Editor: editor@clipmaster.id / demo123
  - Reviewer: reviewer@clipmaster.id / demo123
  - Team: ${team.name} (3 seats)
  - ${videos.length} videos
  - ${createdClips.length} clips
  - 1 export DONE, 1 approval, 1 post job
`)
}

main().catch(e=>{ console.error(e); process.exit(1)}).finally(()=>prisma.$disconnect())
