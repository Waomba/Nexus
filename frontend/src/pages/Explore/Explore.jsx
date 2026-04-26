import { useState, useEffect } from 'react'
import api from '../../utils/api'
import { Link } from 'react-router-dom'
import { Heart, MessageCircle, Share2, Search, TrendingUp, Users, Flame } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

const CATEGORIES = ['All','Tech','Art & Design','Music','Travel','Food','Fitness','Science','Business','Gaming']

function ExplorePostCard({ post, onLike }) {
  const [liked, setLiked] = useState(!!post.liked)
  const [likes, setLikes] = useState(parseInt(post.likes)||0)

  const toggleLike = async e => {
    e.stopPropagation()
    try {
      if (liked) { await api.post(`/posts/${post.id}/unlike`); setLikes(l=>l-1) }
      else        { await api.post(`/posts/${post.id}/like`);   setLikes(l=>l+1) }
      setLiked(l=>!l)
    } catch {}
  }

  const time = post.created_at ? formatDistanceToNow(new Date(post.created_at),{addSuffix:true}) : ''

  return (
    <div className="post-card-v3 fade-in" style={{cursor:'default'}}>
      <div className="post-header">
        <Link to={`/profile/${post.user_id}`} style={{flexShrink:0}}>
          <div style={{width:40,height:40,borderRadius:'50%',background:'var(--primary-light)',color:'var(--primary)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,fontWeight:700,overflow:'hidden'}}>
            {post.avatar?<img src={post.avatar} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:post.name?.[0]}
          </div>
        </Link>
        <div style={{flex:1,minWidth:0}}>
          <Link to={`/profile/${post.user_id}`} style={{fontWeight:700,fontSize:14,color:'var(--text-primary)',textDecoration:'none'}}>{post.name}</Link>
          <div style={{fontSize:12,color:'var(--text-muted)'}}>{time}</div>
        </div>
        {post.likes > 20 && <span className="badge badge-warning"><Flame size={10}/> Trending</span>}
      </div>

      <div className="post-body">{post.content?.length>220?post.content.slice(0,220)+'…':post.content}</div>

      {post.media && (
        post.media_type==='video'
          ? <video src={post.media} controls className="post-media-vid"/>
          : <img src={post.media} alt="" className="post-media"/>
      )}

      <div className="post-actions">
        <button className={`post-act-btn${liked?' liked':''}`} onClick={toggleLike}>
          <Heart size={16} fill={liked?'currentColor':'none'}/> {likes}
        </button>
        <button className="post-act-btn">
          <MessageCircle size={16}/> {post.comment_count||0}
        </button>
        <button className="post-act-btn" onClick={()=>{navigator.clipboard.writeText(window.location.origin+`/profile/${post.user_id}`);toast.success('Link copied!')}}>
          <Share2 size={16}/>
        </button>
      </div>
    </div>
  )
}

function UserSuggestionCard({ user }) {
  const [following, setFollowing] = useState(false)
  const follow = async () => {
    try {
      if (following) await api.post(`/users/${user.id}/unfollow`)
      else           await api.post(`/users/${user.id}/follow`)
      setFollowing(f=>!f)
    } catch {}
  }
  return (
    <div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 16px',borderBottom:'1px solid var(--border)'}}>
      <Link to={`/profile/${user.id}`} style={{flexShrink:0}}>
        <div style={{width:42,height:42,borderRadius:'50%',background:'var(--primary-light)',color:'var(--primary)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,fontWeight:700,overflow:'hidden'}}>
          {user.avatar?<img src={user.avatar} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:user.name?.[0]}
        </div>
      </Link>
      <div style={{flex:1,minWidth:0}}>
        <Link to={`/profile/${user.id}`} style={{fontWeight:600,fontSize:13.5,color:'var(--text-primary)',textDecoration:'none',display:'block',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user.name}</Link>
        <div style={{fontSize:12,color:'var(--text-muted)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>@{user.username} · Trust {user.trust_score}</div>
      </div>
      <button onClick={follow} className={`btn btn-sm ${following?'btn-secondary':'btn-outline-primary'}`} style={{fontSize:12,padding:'5px 12px',flexShrink:0}}>
        {following?'Following':'Follow'}
      </button>
    </div>
  )
}

export default function Explore() {
  const [posts,    setPosts]    = useState([])
  const [users,    setUsers]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [category, setCategory] = useState('All')
  const [query,    setQuery]    = useState('')
  const [searchRes,setSearchRes] = useState(null)
  const [searching,setSearching] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get('/posts/explore').then(r => setPosts(r.data.data||[])),
      api.get('/reputation/leaderboard').then(r => setUsers(r.data.data?.slice(0,6)||[])),
    ]).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (query.length < 2) { setSearchRes(null); return }
    const t = setTimeout(async () => {
      setSearching(true)
      try { const r = await api.get(`/users/search?q=${encodeURIComponent(query)}`); setSearchRes(r.data.data||[]) }
      catch {} finally { setSearching(false) }
    }, 350)
    return () => clearTimeout(t)
  }, [query])

  return (
    <div style={{maxWidth:1100,margin:'0 auto',padding:'0 0 20px'}}>
      {/* Hero banner */}
      <div className="explore-hero">
        <h2>Discover what's happening</h2>
        <p>Trending posts, people to follow, and content you'll love</p>
      </div>

      {/* Category chips */}
      <div className="explore-trending">
        {CATEGORIES.map(c=>(
          <button key={c} className={`trend-chip${category===c?' active':''}`} onClick={()=>setCategory(c)}>{c}</button>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:20,padding:'16px 16px 0',alignItems:'start'}}>
        {/* Feed */}
        <div>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14}}>
            <TrendingUp size={17} color="var(--primary)"/>
            <h3 style={{fontSize:15,fontWeight:700}}>Trending posts</h3>
          </div>

          {loading ? (
            Array(4).fill(0).map((_,i)=>(
              <div key={i} className="post-card-v3" style={{padding:16}}>
                <div style={{display:'flex',gap:10,marginBottom:12}}>
                  <div style={{width:40,height:40,borderRadius:'50%',background:'var(--bg)',flexShrink:0}}/>
                  <div style={{flex:1}}><div style={{height:12,background:'var(--bg)',borderRadius:4,marginBottom:8,width:'40%'}}/><div style={{height:10,background:'var(--bg)',borderRadius:4,width:'25%'}}/></div>
                </div>
                <div style={{height:13,background:'var(--bg)',borderRadius:4,marginBottom:8}}/>
                <div style={{height:13,background:'var(--bg)',borderRadius:4,width:'80%',marginBottom:8}}/>
                <div style={{height:13,background:'var(--bg)',borderRadius:4,width:'60%'}}/>
              </div>
            ))
          ) : posts.length===0 ? (
            <div style={{textAlign:'center',padding:'3rem',color:'var(--text-secondary)'}}>No posts yet</div>
          ) : (
            posts.map(p=><ExplorePostCard key={p.id} post={p}/>)
          )}
        </div>

        {/* Right panel */}
        <div style={{position:'sticky',top:76}}>
          {/* People search */}
          <div className="card" style={{marginBottom:16,overflow:'hidden',padding:0}}>
            <div style={{padding:'14px 16px 10px',borderBottom:'1px solid var(--border)'}}>
              <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:10}}>
                <Users size={15} color="var(--primary)"/>
                <span style={{fontWeight:700,fontSize:14}}>Find people</span>
              </div>
              <div style={{position:'relative'}}>
                <Search size={13} style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'var(--text-muted)'}}/>
                <input className="form-control" style={{paddingLeft:30,height:34,fontSize:13,borderRadius:'var(--radius-pill)'}}
                  placeholder="Search by name…"
                  value={query} onChange={e=>setQuery(e.target.value)}/>
              </div>
            </div>
            {searching && <div style={{padding:'10px 16px',color:'var(--text-muted)',fontSize:13}}>Searching…</div>}
            {searchRes?.length===0 && <div style={{padding:'10px 16px',color:'var(--text-muted)',fontSize:13}}>No users found</div>}
            {searchRes?.slice(0,5).map(u=><UserSuggestionCard key={u.id} user={u}/>)}
          </div>

          {/* Top users */}
          <div className="card" style={{overflow:'hidden',padding:0}}>
            <div style={{padding:'14px 16px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:6}}>
              <TrendingUp size={15} color="var(--nx-orange)"/>
              <span style={{fontWeight:700,fontSize:14}}>Who to follow</span>
            </div>
            {users.length===0 && !loading && <div style={{padding:'14px 16px',color:'var(--text-muted)',fontSize:13}}>No users yet</div>}
            {users.map(u=><UserSuggestionCard key={u.id} user={u}/>)}
          </div>
        </div>
      </div>
    </div>
  )
}
