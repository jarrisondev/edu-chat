import { FC, useEffect } from 'react'
import { useRouter } from 'expo-router'
import { Group } from '../../types/Group'
import { routes } from '../../utils/routes'
import { useAppSelector } from '../../store'
import { Feather } from '@expo/vector-icons'
import { Menu, Pressable, Text } from 'native-base'
import { useFetchDeleteGroup } from '../../services/groups'

interface Props {
	group: Group | undefined
}

export const GroupMenu: FC<Props> = (props) => {
	const router = useRouter()
	const { mutate } = useFetchDeleteGroup()
	const user = useAppSelector((state) => state.userSlice.user)
	const isAdmin = props.group?.admins.includes(user?.uid ?? '')

	return (
		<Menu
			w='190'
			trigger={(triggerProps) => {
				return (
					<Pressable accessibilityLabel='More options menu' {...triggerProps}>
						<Feather name='more-vertical' size={20} color='white' />
					</Pressable>
				)
			}}
		>
			{isAdmin ? (
				<>
					<Menu.Item>Edit</Menu.Item>
					<Menu.Item
						onPress={() => {
							router.push(routes.home)
							mutate(props.group?.id ?? '')
						}}
					>
						<Text color='red.500'>Delete</Text>
					</Menu.Item>
				</>
			) : (
				<Menu.Item>
					<Text color='red.500'>Leave</Text>
				</Menu.Item>
			)}
		</Menu>
	)
}