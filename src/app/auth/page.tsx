'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AuthPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
  })

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      alert('Please fill in all fields!')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })
    if (error) {
      alert(error.message)
    } else {
      // Check if admin
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        if (profile?.role === 'admin') {
          router.push('/admin')
        } else {
          router.push('/dashboard')
        }
      }
    }
    setLoading(false)
  }

  const handleSignup = async () => {
    if (!form.email || !form.password || !form.full_name || !form.phone) {
      alert('Please fill in all fields!')
      return
    }
    if (form.password.length < 6) {
      alert('Password must be at least 6 characters!')
      return
    }
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })
    if (error) {
      alert(error.message)
    } else if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: form.full_name,
        phone: form.phone,
        role: 'customer',
      })
      alert('Account created successfully! Please check your email to verify your account.')
      setIsLogin(true)
    }
    setLoading(false)
  }

  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(124,58,237,0.3)',
    color: 'white',
    borderRadius: '12px',
    padding: '14px 16px',
    width: '100%',
    outline: 'none',
    fontSize: '14px',
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{background: '#0a0a0a'}}>

      {/* Background glow */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-20 pointer-events-none" style={{background: 'radial-gradient(circle, #7c3aed, transparent)', filter: 'blur(80px)'}}></div>

      <div className="w-full max-w-md relative z-10">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-4xl font-black tracking-wider" style={{background: 'linear-gradient(135deg, #a78bfa, #f6d365)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
              ✦ FRESHMART
            </h1>
          </Link>
          <p className="text-gray-500 text-sm mt-2">Your Premium Online Supermarket</p>
        </div>

        {/* Card */}
        <div className="card p-8">

          {/* Tabs */}
          <div className="flex mb-8 rounded-xl overflow-hidden" style={{background: 'rgba(255,255,255,0.05)'}}>
            <button
              onClick={() => setIsLogin(true)}
              className="flex-1 py-3 text-sm font-black transition-all"
              style={isLogin
                ? {background: 'linear-gradient(135deg, #7c3aed, #4c1d95)', color: 'white'}
                : {color: '#6b7280'}
              }
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className="flex-1 py-3 text-sm font-black transition-all"
              style={!isLogin
                ? {background: 'linear-gradient(135deg, #7c3aed, #4c1d95)', color: 'white'}
                : {color: '#6b7280'}
              }
            >
              Sign Up
            </button>
          </div>

          <div className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-wider">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-wider">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    style={inputStyle}
                  />
                </div>
              </>
            )}

            <div>
              <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-wider">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                style={inputStyle}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-wider">
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                style={inputStyle}
              />
            </div>

            <button
              onClick={isLogin ? handleLogin : handleSignup}
              disabled={loading}
              className="w-full py-4 rounded-xl font-black text-white text-lg transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed mt-4"
              style={{background: 'linear-gradient(135deg, #7c3aed, #4c1d95)', boxShadow: '0 8px 30px rgba(124,58,237,0.4)'}}
            >
              {loading ? '⏳ Please wait...' : isLogin ? '🔐 Login' : '✅ Create Account'}
            </button>
          </div>

          <p className="text-center text-gray-600 text-sm mt-6">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-bold"
              style={{color: '#a78bfa'}}
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </p>

        </div>

        <p className="text-center text-gray-700 text-xs mt-6">
          <Link href="/" className="hover:text-purple-400 transition">
            ← Back to Store
          </Link>
        </p>

      </div>
    </div>
  )
}
