import { FC } from 'react'
import { type User } from '../../types/user'
import { CustomAvatar } from './CustomAvatar'
import { AntDesign } from '@expo/vector-icons'
import { Box, Pressable, Text, VStack } from 'native-base'

interface Props {
	contact: User
	userId: string | undefined
	isContact?: boolean
	add?: boolean
	remove?: boolean
	addToGroup?: () => void
	removeFromGroup?: () => void
}

export const UserCardInf: FC<Props> = (props) => {
	const { contact } = props

	return (
		<Box flexDir='row' px='4' py='2' width='full' bg='coolGray.700' alignItems='center'>
			<Box width='1/6'>
				<CustomAvatar imageURI={contact.avatar} />
			</Box>
			<VStack ml='1' width='4/6'>
				<Text width='full' color='white' bold>
					{contact.name}
				</Text>
				<Text width='full' numberOfLines={1} color='white'>
					{contact.description}
				</Text>
			</VStack>
			<Box width='1/6'>
				{props.addToGroup && (
					<Pressable width='full' alignItems='flex-end' pr='2' onPress={props.addToGroup}>
						<AntDesign name='pluscircleo' size={24} color='white' />
					</Pressable>
				)}
				{props.removeFromGroup && (
					<Pressable width='full' alignItems='flex-end' pr='2' onPress={props.removeFromGroup}>
						<AntDesign name='pluscircle' size={24} color='#22c55e' />
					</Pressable>
				)}
			</Box>
		</Box>
	)
}
