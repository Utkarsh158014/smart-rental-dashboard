import { createContext, useContext, useMemo, useReducer, useEffect } from 'react'

const AppContext = createContext(null)

const DEFAULT_BIKE_IMAGE = 'https://imgd.aeplcdn.com/1056x594/n/cw/ec/201293/hunter-350-2025-right-side-view-5.jpeg?isig=0&q=80'

const initial = {
	stations: [
		{ id: 'st-1', name: 'Central Park', lat: 40.785091, lng: -73.968285, capacity: 12 },
		{ id: 'st-2', name: 'Times Square', lat: 40.758896, lng: -73.985130, capacity: 10 },
		{ id: 'st-3', name: 'Brooklyn Bridge', lat: 40.706086, lng: -73.996864, capacity: 8 },
	],
	bikes: [
		{ id: 'bk-1', name: 'Bike 1', stationId: 'st-1', status: 'available', battery: 92, image: 'https://www.onroadz.in/wp-content/uploads/2022/03/Yamaha-R15-V4-Bike-Rent-Coimbatore.webp' },
		{ id: 'bk-2', name: 'Bike 2', stationId: 'st-1', status: 'available', battery: 66, image: 'https://static.toiimg.com/photo/80452572.cms' },
		{ id: 'bk-3', name: 'Bike 3', stationId: 'st-2', status: 'available', battery: 80, image: 'https://tuktukph.top/wp-content/uploads/2023/04/TVS-Ntorq-Race-Edition-red.jpg' },
		{ id: 'bk-4', name: 'Bike 4', stationId: 'st-2', status: 'maintenance', battery: 0, image: 'https://imgd.aeplcdn.com/1200x900/n/cw/ec/201293/hunter-350-2025-right-side-view-2.jpeg?isig=0' },
		{ id: 'bk-5', name: 'Bike 5', stationId: 'st-3', status: 'available', battery: 54, image: 'https://images.overdrive.in/wp-content/odgallery/2022/08/63809_2022_Royal_Enfield_Hunter_350_468x263.jpg' },
	],
	rentals: [],
	transactions: [],
	user: { id: 'u-1', name: 'Guest', role: 'user', wallet: 500 },
	earnings: 0,
}

function reducer(state, action){
	switch(action.type){
		case 'ADD_BIKE': {
			const { name, stationId, image, battery } = action
			const newBike = {
				id: `bk-${Date.now()}`,
				name: name || `Bike ${state.bikes.length+1}`,
				stationId: stationId || state.stations[0]?.id,
				status: 'available',
				battery: typeof battery==='number'? battery : 100,
				image: image && image.trim()? image : DEFAULT_BIKE_IMAGE,
			}
			return { ...state, bikes: [newBike, ...state.bikes] }
		}
		case 'REMOVE_BIKE': {
			const { bikeId } = action
			const bikes = state.bikes.filter(b => b.id !== bikeId)
			const rentals = state.rentals.filter(r => r.bikeId !== bikeId)
			return { ...state, bikes, rentals }
		}
		case 'RENT_START': {
			const { bikeId } = action
			const bikes = state.bikes.map(b => b.id===bikeId? { ...b, status:'rented' } : b)
			const rental = { id: `r-${Date.now()}`, bikeId, userId: state.user.id, start: Date.now(), end: null, cost: 0 }
			return { ...state, bikes, rentals: [rental, ...state.rentals] }
		}
		case 'RENT_END': {
			const { rentalId, ratePerMin } = action
			let amount = 0
			const rentals = state.rentals.map(r => {
				if (r.id!==rentalId) return r
				const minutes = Math.max(1, Math.round((Date.now()-r.start)/60000))
				amount = minutes * ratePerMin
				return { ...r, end: Date.now(), cost: amount }
			})
			const bikes = state.bikes.map(b => {
				const r = rentals.find(x=>x.bikeId===b.id && x.id===rentalId)
				return r? { ...b, status:'available' } : b
			})
			const user = { ...state.user, wallet: Math.max(0, state.user.wallet - amount) }
			const txn = { id: `t-${Date.now()}`, type: 'debit', amount, note: 'Rental charge', createdAt: Date.now() }
			return { ...state, rentals, bikes, user, earnings: state.earnings + amount, transactions: [txn, ...state.transactions] }
		}
		case 'ADD_FUNDS': {
			const user = { ...state.user, wallet: state.user.wallet + action.amount }
			const txn = { id: `t-${Date.now()}`, type: 'credit', amount: action.amount, note: action.note || 'Wallet top-up', createdAt: Date.now() }
			return { ...state, user, transactions: [txn, ...state.transactions] }
		}
		case 'TICK': {
			const bikes = state.bikes.map(b => {
				if (b.status==='maintenance') return b
				if (Math.random()<0.03){
					return { ...b, status: b.status==='available'? 'rented':'available' }
				}
				return b
			})
			return { ...state, bikes }
		}
		default: return state
	}
}

export function AppProvider({ children }){
	const [state, dispatch] = useReducer(reducer, initial)

	useEffect(()=>{
		const id = setInterval(()=> dispatch({ type:'TICK' }), 3000)
		return ()=> clearInterval(id)
	},[])

	const value = useMemo(()=>{
		const available = state.bikes.filter(b=>b.status==='available').length
		const inUse = state.bikes.filter(b=>b.status==='rented').length
		const active = state.rentals.filter(r=>!r.end).length
		return {
			state,
			dispatch,
			kpis: { available, inUse, active, earnings: state.earnings },
			addBike: (payload)=> dispatch({ type:'ADD_BIKE', ...payload }),
			removeBike: (bikeId)=> dispatch({ type:'REMOVE_BIKE', bikeId }),
			rentStart: (bikeId)=> dispatch({ type:'RENT_START', bikeId }),
			rentEnd: (rentalId, ratePerMin=2)=> dispatch({ type:'RENT_END', rentalId, ratePerMin }),
			addFunds: (amount, note)=> dispatch({ type:'ADD_FUNDS', amount, note }),
		}
	},[state])

	return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(){
	const ctx = useContext(AppContext)
	if (!ctx) throw new Error('useApp must be used within AppProvider')
	return ctx
}
