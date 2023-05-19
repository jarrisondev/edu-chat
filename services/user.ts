import { type User } from '../types/user'
import { useUser } from '../hooks/useUser'
import { useMutation } from '@tanstack/react-query'
import { COLLECTIONS } from '../utils/firebaseConsts'
import { useAppDispatch, useAppSelector } from '../store'
import { handleAddContacts } from '../store/user/userSlice'
import { auth, database, storage } from '../config/firebaseConfig'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Unsubscribe, createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore'

interface NewUserType {
	user: User
	password: string
}

// TODO: type correctly
const fetchNewUser: any = async ({ user, password }: NewUserType) => {
	const newAuthUser = await createUserWithEmailAndPassword(auth, user.email, password)

	const newUser: User = {
		uid: newAuthUser.user.uid,
		name: user.name,
		email: user.email,
		avatar: '',
		description: '',
		contacts: []
	}
	await setDoc(doc(database, COLLECTIONS.USERS, newAuthUser.user.uid), newUser)
	return newUser
}
export const useFetchNewUser = () => useMutation((data: NewUserType) => fetchNewUser(data), {})

const fetchUpdateUser = async (user: User): Promise<User | undefined> => {
	try {
		let avatarUrl = user.avatar

		if (avatarUrl.search('firebasestorage') === -1 && avatarUrl !== '') {
			const avatarRef = ref(storage, `avatars/${user.uid}`)
			const img = await fetch(avatarUrl)
			const bytes = await img.blob()

			await uploadBytes(avatarRef, bytes, { contentType: 'image/jpeg' })
			const url = await getDownloadURL(avatarRef)
			avatarUrl = url
		}

		await updateDoc(doc(database, COLLECTIONS.USERS, user.uid), {
			name: user.name,
			avatar: avatarUrl,
			description: user.description
		})
		return user
	} catch (e) {
		console.log(e)
	}
}
export const useFetchUpdateUser = () => useMutation(async (user: User) => await fetchUpdateUser(user), {})
//
const fetchGetUserContacts = (
	userId: string,
	setContacts: Dispatch<SetStateAction<User[]>>,
	setUser: Dispatch<SetStateAction<User | null>>
): Unsubscribe => {
	try {
		const unsubscribe = onSnapshot(doc(database, COLLECTIONS.USERS, userId), (crrDoc) => {
			if (!crrDoc.exists()) return

			const contactsIds: string[] = crrDoc.data().contacts ?? []
			const contacts: User[] = []

			Promise.all(
				contactsIds.map(async (contactId) => {
					const docRef = doc(database, COLLECTIONS.USERS, contactId)
					const docSnap = await getDoc(docRef)
					if (docSnap.exists()) contacts.push(docSnap.data() as User)
				})
			).then(() => {
				setUser(crrDoc.data() as User)
				setContacts(contacts)
			})
		})

		return unsubscribe
	} catch (e) {
		console.log(e)
		return () => {}
	}
}
export const useListenUserChanges = () => {
	const { setUser } = useUser()
	const dispatch = useAppDispatch()
	const [userData, setUserData] = useState<User | null>(null)
	const [contacts, setContacts] = useState<User[]>([])
	const user = useAppSelector((state) => state.userSlice.user)
	const userId = user?.uid ?? ''

	useEffect(() => {
		const unsubscribe = fetchGetUserContacts(userId, setContacts, setUserData)
		return () => {
			unsubscribe()
		}
	}, [])

	useEffect(() => {
		if (userData) setUser(userData)
		dispatch(handleAddContacts(contacts))
	}, [contacts])
}
