'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const nigeriaLocations: any = {
  'Abia': {
    'Aba North': ['Ariaria', 'Eziama', 'Ogbor Hill', 'Omoba', 'Osisioma'],
    'Aba South': ['Aba', 'Ekeonunwa', 'Ezimba', 'Umuoha'],
    'Umuahia North': ['Umuahia', 'Ibeku', 'Ikwuano'],
  },
  'Adamawa': {
    'Yola North': ['Yola', 'Jimeta', 'Jambutu'],
    'Yola South': ['Yola South', 'Bole', 'Demsawo'],
  },
  'Anambra': {
    'Awka North': ['Awka', 'Amawbia', 'Mgbakwu'],
    'Onitsha North': ['Onitsha', 'Fegge', 'GRA'],
    'Nnewi North': ['Nnewi', 'Otolo', 'Uruagu'],
  },
  'Bauchi': {
    'Bauchi': ['Bauchi', 'Wunti', 'Makama'],
    'Tafawa Balewa': ['Tafawa Balewa', 'Bununu', 'Tapshin'],
  },
  'Benue': {
    'Makurdi': ['Makurdi', 'High Level', 'North Bank'],
    'Gboko': ['Gboko', 'Yandev', 'Tse-Agberagba'],
  },
  'Borno': {
    'Maiduguri': ['Maiduguri', 'Bulumkutu', 'Gomari'],
    'Biu': ['Biu', 'Miringa', 'Mandaragirau'],
  },
  'Cross River': {
    'Calabar Municipal': ['Calabar', 'Watt Market', 'Mary Slessor'],
    'Calabar South': ['Calabar South', 'Ikot Ansa', 'Edim Otop'],
  },
  'Delta': {
    'Warri South': ['Warri', 'Okumagba', 'Effurun'],
    'Asaba': ['Asaba', 'Cable Point', 'GRA'],
    'Uvwie': ['Effurun', 'Ekpan', 'Ugboroke'],
  },
  'Ebonyi': {
    'Abakaliki': ['Abakaliki', 'Mile 50', 'Kpirikpiri'],
    'Onueke': ['Onueke', 'Ezza', 'Igbeagu'],
  },
  'Edo': {
    'Oredo': ['Benin City', 'Ring Road', 'Uselu'],
    'Egor': ['Uselu', 'Ugbowo', 'Ikpoba Hill'],
    'Ikpoba Okha': ['Ikpoba Hill', 'New Benin', 'Ogida'],
  },
  'Ekiti': {
    'Ado Ekiti': ['Ado Ekiti', 'Basiri', 'Oke Ila'],
    'Ikere': ['Ikere', 'Ara', 'Oke Ayedun'],
  },
  'Enugu': {
    'Enugu North': ['Enugu', 'Ogui', 'Abakpa'],
    'Enugu South': ['Enugu South', 'Independence Layout', 'GRA'],
    'Igbo Eze North': ['Igbo Eze', 'Ogrute', 'Aji'],
  },
  'FCT': {
    'Abuja Municipal': ['Wuse', 'Garki', 'Maitama', 'Asokoro', 'Gwarinpa', 'Kubwa'],
    'Bwari': ['Bwari', 'Dutse', 'Byazin'],
    'Gwagwalada': ['Gwagwalada', 'Dobi', 'Paikon Kore'],
  },
  'Gombe': {
    'Gombe': ['Gombe', 'Pantami', 'Tudun Wada'],
    'Kaltungo': ['Kaltungo', 'Cham', 'Shongom'],
  },
  'Imo': {
    'Owerri Municipal': ['Owerri', 'Douglas Road', 'Ikenegbu'],
    'Owerri North': ['Owerri North', 'Naze', 'Orji'],
    'Orlu': ['Orlu', 'Awo Omamma', 'Mgbidi'],
  },
  'Jigawa': {
    'Dutse': ['Dutse', 'Takur', 'Kiyawa'],
    'Hadejia': ['Hadejia', 'Auyo', 'Birniwa'],
  },
  'Kaduna': {
    'Kaduna North': ['Kaduna', 'Barnawa', 'Rigasa'],
    'Kaduna South': ['Kaduna South', 'Kakuri', 'Gonin Gora'],
    'Zaria': ['Zaria', 'Sabon Gari', 'Tudun Wada'],
  },
  'Kano': {
    'Kano Municipal': ['Kano', 'Sabon Gari', 'Fagge'],
    'Fagge': ['Fagge', 'Gwangwan', 'Yan Awaki'],
    'Nassarawa': ['Nassarawa', 'Gyadi Gyadi', 'Tarauni'],
  },
  'Katsina': {
    'Katsina': ['Katsina', 'Kofar Kaura', 'Kofar Marusa'],
    'Daura': ['Daura', 'Sandamu', 'Zango'],
  },
  'Kebbi': {
    'Birnin Kebbi': ['Birnin Kebbi', 'Kalgo', 'Gwandu'],
    'Argungu': ['Argungu', 'Arewa', 'Dandi'],
  },
  'Kogi': {
    'Lokoja': ['Lokoja', 'Felele', 'Ganaja'],
    'Ankpa': ['Ankpa', 'Ogugu', 'Omala'],
  },
  'Kwara': {
    'Ilorin East': ['Ilorin', 'Tanke', 'Fate'],
    'Ilorin West': ['Ilorin West', 'Oja Oba', 'Mandate'],
    'Offa': ['Offa', 'Lafiagi', 'Patigi'],
  },
  'Lagos': {
    'Alimosho': ['Ikotun', 'Egbeda', 'Idimu', 'Ipaja', 'Ayobo', 'Shasha'],
    'Ajeromi-Ifelodun': ['Ajegunle', 'Amukoko', 'Layeni', 'Orile'],
    'Kosofe': ['Ketu', 'Mile 12', 'Ojota', 'Oworoshoki'],
    'Mushin': ['Mushin', 'Idi-Araba', 'Ojuelegba', 'Papa Ajao'],
    'Oshodi-Isolo': ['Oshodi', 'Isolo', 'Ejigbo', 'Shogunle'],
    'Ojo': ['Ojo', 'Alaba', 'Ajangbadi', 'Irede'],
    'Agege': ['Agege', 'Ifako', 'Oko Oba', 'Dopemu'],
    'Ifako-Ijaiye': ['Ifako', 'Ijaiye', 'Ogba', 'Aguda'],
    'Surulere': ['Surulere', 'Ojuelegba', 'Itire', 'Aguda'],
    'Ikeja': ['Ikeja', 'Allen', 'Oregun', 'Maryland', 'Ojodu'],
    'Eti-Osa': ['Lekki', 'Victoria Island', 'Ajah', 'Sangotedo', 'Obalende'],
    'Lagos Island': ['Lagos Island', 'Eko', 'Campos', 'Marina'],
    'Lagos Mainland': ['Ebute Metta', 'Yaba', 'Ojuelegba', 'Costain'],
    'Ikorodu': ['Ikorodu', 'Benson', 'Igbogbo', 'Imota'],
    'Badagry': ['Badagry', 'Ajara', 'Aradagun', 'Ibereko'],
    'Epe': ['Epe', 'Poka', 'Ejinrin', 'Itoikin'],
  },
  'Nasarawa': {
    'Lafia': ['Lafia', 'Gurku', 'Mararaba'],
    'Keffi': ['Keffi', 'Mararaba', 'Gitata'],
  },
  'Niger': {
    'Minna': ['Minna', 'Bosso', 'Chanchaga'],
    'Suleja': ['Suleja', 'Tafa', 'Gurara'],
  },
  'Ogun': {
    'Abeokuta North': ['Abeokuta', 'Lafenwa', 'Iberekodo'],
    'Abeokuta South': ['Abeokuta South', 'Oke Ona', 'Kemta'],
    'Sagamu': ['Sagamu', 'Ogijo', 'Ilishan'],
    'Ijebu Ode': ['Ijebu Ode', 'Ago Iwoye', 'Ijebu Igbo'],
  },
  'Ondo': {
    'Akure North': ['Akure', 'Alagbaka', 'Shagari'],
    'Akure South': ['Akure South', 'Oda Road', 'Oshinle'],
    'Ondo West': ['Ondo', 'Kajola', 'Ilara'],
  },
  'Osun': {
    'Osogbo': ['Osogbo', 'Oke Fia', 'Alekuwodo'],
    'Ile Ife': ['Ile Ife', 'Mayfair', 'Lagere'],
    'Ilesa East': ['Ilesa', 'Garage Olode', 'Ijebu Jesa'],
  },
  'Oyo': {
    'Ibadan North': ['Bodija', 'UI', 'Agodi', 'Samonda', 'Sango'],
    'Ibadan South East': ['Oje', 'Mapo', 'Yemetu', 'Oranyan'],
    'Ibadan South West': ['Oluyole', 'Ring Road', 'Iyaganku', 'Jericho'],
    'Ibadan North East': ['Iwo Road', 'Felele', 'Challenge', 'Agugu'],
    'Ogbomoso North': ['Ogbomoso', 'Arowomole', 'Takie'],
    'Oyo East': ['Oyo', 'Atiba', 'Eruwa'],
  },
  'Plateau': {
    'Jos North': ['Jos', 'Terminus', 'Dilimi', 'Rantya'],
    'Jos South': ['Bukuru', 'Vom', 'Shen'],
    'Mangu': ['Mangu', 'Bokkos', 'Ampang'],
  },
  'Rivers': {
    'Port Harcourt': ['Port Harcourt', 'Rumuola', 'Rumuokoro', 'Eleme', 'Diobu'],
    'Obio-Akpor': ['Rumuola', 'Rumuokoro', 'Choba', 'Rumurola'],
    'Okrika': ['Okrika', 'Ogoloma', 'Ibaka'],
  },
  'Sokoto': {
    'Sokoto North': ['Sokoto', 'Gawon Nama', 'Kara'],
    'Sokoto South': ['Sokoto South', 'Runjin Sambo', 'Mabera'],
  },
  'Taraba': {
    'Jalingo': ['Jalingo', 'Yelwa', 'Sarkin Dawaki'],
    'Wukari': ['Wukari', 'Chanchanji', 'Rafin Kada'],
  },
  'Yobe': {
    'Damaturu': ['Damaturu', 'Gujba', 'Fika'],
    'Potiskum': ['Potiskum', 'Nangere', 'Jakusko'],
  },
  'Zamfara': {
    'Gusau': ['Gusau', 'Sabon Gari', 'Tudun Wada'],
    'Kaura Namoda': ['Kaura Namoda', 'Birnin Magaji', 'Zurmi'],
  },
}

export default function CheckoutPage() {
  const router = useRouter()
  const [cart, setCart] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [selectedState, setSelectedState] = useState('')
  const [selectedLga, setSelectedLga] = useState('')
  const [selectedBusStop, setSelectedBusStop] = useState('')
  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    street_address: '',
    notes: '',
  })

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('cart') || '[]')
    if (saved.length === 0) router.push('/cart')
    setCart(saved)
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth')
      return
    }
    setUser(user)
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    if (profile) {
      setForm((prev) => ({
        ...prev,
        customer_name: profile.full_name || '',
        customer_phone: profile.phone || '',
        customer_email: user.email || '',
      }))
    }
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const deliveryDate = () => {
    const date = new Date()
    date.setDate(date.getDate() + 3)
    return date.toLocaleDateString('en-NG', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const getStates = () => Object.keys(nigeriaLocations).sort()
  const getLgas = () => selectedState ? Object.keys(nigeriaLocations[selectedState]).sort() : []
  const getBusStops = () => selectedState && selectedLga ? nigeriaLocations[selectedState][selectedLga] : []

  const handlePayment = async () => {
    if (!form.customer_name || !form.customer_phone || !selectedState || !selectedLga || !selectedBusStop) {
      alert('Please fill in all required fields!')
      return
    }

    setLoading(true)

    const deliveryAddress = `${form.street_address}, ${selectedBusStop}, ${selectedLga}, ${selectedState}`

    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: form.customer_name,
          customer_email: form.customer_email,
          customer_phone: form.customer_phone,
          delivery_address: deliveryAddress,
          state: selectedState,
          lga: selectedLga,
          bus_stop: selectedBusStop,
          notes: form.notes,
          total_amount: total,
          status: 'pending',
          payment_status: 'unpaid',
          delivery_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          user_id: user?.id,
        })
        .select()
        .single()

      if (orderError) throw orderError

      const orderItems = cart.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
      }))

      await supabase.from('order_items').insert(orderItems)

      // Initialize Paystack payment
      const PaystackPop = (await import('@paystack/inline-js')).default
      const paystack = new PaystackPop()

      paystack.newTransaction({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
        email: form.customer_email,
        amount: total * 100, // Paystack uses kobo
        currency: 'NGN',
        ref: `FRESHMART-${order.id.slice(0, 8).toUpperCase()}-${Date.now()}`,
        metadata: {
          order_id: order.id,
          customer_name: form.customer_name,
        },
        onSuccess: async (transaction: any) => {
          // Update order payment status
          await supabase
            .from('orders')
            .update({
              payment_status: 'paid',
              payment_reference: transaction.reference,
              status: 'confirmed',
            })
            .eq('id', order.id)

          localStorage.setItem('cart', '[]')
          router.push(`/orders/success?id=${order.id}`)
        },
        onCancel: async () => {
          // Delete order if payment cancelled
          await supabase.from('order_items').delete().eq('order_id', order.id)
          await supabase.from('orders').delete().eq('id', order.id)
          alert('Payment cancelled. Your order was not placed.')
          setLoading(false)
        },
      })

    } catch (error) {
      alert('Something went wrong. Please try again!')
      console.error(error)
      setLoading(false)
    }
  }

  const inputStyle = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(124,58,237,0.3)',
    color: 'white',
    borderRadius: '12px',
    padding: '12px 16px',
    width: '100%',
    outline: 'none',
    fontSize: '14px',
  }

  const selectStyle = {
    background: '#1a1a2e',
    border: '1px solid rgba(124,58,237,0.3)',
    color: 'white',
    borderRadius: '12px',
    padding: '12px 16px',
    width: '100%',
    outline: 'none',
    fontSize: '14px',
  }

  return (
    <div className="min-h-screen" style={{background: '#0a0a0a'}}>

      {/* Navbar */}
      <nav style={{background: 'linear-gradient(180deg, #0d0d1a 0%, rgba(13,13,26,0.95) 100%)', borderBottom: '1px solid rgba(124,58,237,0.3)'}} className="sticky top-0 z-50 shadow-2xl">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <h1 className="text-2xl font-black tracking-wider" style={{background: 'linear-gradient(135deg, #a78bfa, #f6d365)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
              ✦ FRESHMART
            </h1>
          </Link>
          <Link href="/cart" className="text-sm text-purple-300 hover:text-white transition">
            ← Back to Cart
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-8">
          <p className="text-purple-400 text-xs font-bold tracking-widest uppercase mb-1">Final Step</p>
          <h1 className="text-3xl font-black text-white">Checkout</h1>
        </div>

        <div className="flex flex-col md:flex-row gap-6">

          {/* Form */}
          <div className="flex-1 space-y-4">

            {/* Personal Info */}
            <div className="card p-6">
              <p className="text-purple-400 text-xs font-bold tracking-widest uppercase mb-5">
                👤 Personal Information
              </p>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-wider">Full Name *</label>
                  <input type="text" name="customer_name" value={form.customer_name} onChange={handleChange} placeholder="Enter your full name" style={inputStyle} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-wider">Email *</label>
                  <input type="email" name="customer_email" value={form.customer_email} onChange={handleChange} placeholder="Enter your email" style={inputStyle} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-wider">Phone Number *</label>
                  <input type="tel" name="customer_phone" value={form.customer_phone} onChange={handleChange} placeholder="Enter your phone number" style={inputStyle} />
                </div>
              </div>
            </div>

            {/* Delivery Location */}
            <div className="card p-6">
              <p className="text-purple-400 text-xs font-bold tracking-widest uppercase mb-5">
                📍 Delivery Location
              </p>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-wider">State *</label>
                  <select
                    value={selectedState}
                    onChange={(e) => { setSelectedState(e.target.value); setSelectedLga(''); setSelectedBusStop('') }}
                    style={selectStyle}
                  >
                    <option value="">Select State</option>
                    {getStates().map((state) => (
                      <option key={state} value={state} style={{background: '#1a1a2e'}}>{state}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-wider">Local Government Area *</label>
                  <select
                    value={selectedLga}
                    onChange={(e) => { setSelectedLga(e.target.value); setSelectedBusStop('') }}
                    style={selectStyle}
                    disabled={!selectedState}
                  >
                    <option value="">Select LGA</option>
                    {getLgas().map((lga) => (
                      <option key={lga} value={lga} style={{background: '#1a1a2e'}}>{lga}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-wider">Nearest Bus Stop *</label>
                  <select
                    value={selectedBusStop}
                    onChange={(e) => setSelectedBusStop(e.target.value)}
                    style={selectStyle}
                    disabled={!selectedLga}
                  >
                    <option value="">Select Bus Stop</option>
                    {getBusStops().map((stop: string) => (
                      <option key={stop} value={stop} style={{background: '#1a1a2e'}}>{stop}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-wider">Street Address</label>
                  <input type="text" name="street_address" value={form.street_address} onChange={handleChange} placeholder="House number, street name" style={inputStyle} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-wider">Order Notes (optional)</label>
                  <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Any special instructions?" rows={2} style={inputStyle} />
                </div>
              </div>
            </div>

            {/* Delivery Date */}
            <div className="card p-4" style={{background: 'linear-gradient(135deg, rgba(52,211,153,0.1), rgba(16,185,129,0.05))', border: '1px solid rgba(52,211,153,0.2)'}}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">📅</span>
                <div>
                  <p className="text-xs font-bold text-green-400 uppercase tracking-wider">Estimated Delivery</p>
                  <p className="font-black text-white">{deliveryDate()}</p>
                </div>
              </div>
            </div>

          </div>

          {/* Summary */}
          <div className="md:w-80 space-y-4">
            <div className="card p-6">
              <p className="text-purple-400 text-xs font-bold tracking-widest uppercase mb-5">
                🧾 Order Summary
              </p>
              <div className="space-y-3 mb-5">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-400 line-clamp-1 flex-1 mr-2">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="font-bold text-white shrink-0">
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{borderTop: '1px solid rgba(124,58,237,0.2)'}} className="pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Delivery</span>
                  <span className="text-green-400 font-semibold">Free</span>
                </div>
                <div className="flex justify-between font-black text-xl mt-2">
                  <span className="text-white">Total</span>
                  <span className="price-tag">₦{total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Payment notice */}
            <div className="card p-4" style={{background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(76,29,149,0.1))', border: '1px solid rgba(124,58,237,0.3)'}}>
              <p className="text-sm font-bold mb-1 text-purple-300">
                💳 Secure Payment
              </p>
              <p className="text-xs text-gray-400">
                Pay securely with Paystack. We accept cards, bank transfer and USSD.
              </p>
            </di
