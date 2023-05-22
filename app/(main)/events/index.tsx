import { useMemo } from 'react'
import { useRouter } from 'expo-router'
import { routes } from '../../../utils/routes'
import { AntDesign } from '@expo/vector-icons'
import { TouchableOpacity } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { Box, Fab, Icon, ScrollView, Text, View } from 'native-base'
import { type SelectedEvent } from '../../../types/Group'
import { useAppDispatch, useAppSelector } from '../../../store'
import { EventCard } from '../../../components/events/EventCard'
import { EventModal } from '../../../components/events/EventModal'
import { handleSelectedEvent } from '../../../store/events/eventsSlice'

export default function Events(): JSX.Element {
	const dispatch = useAppDispatch()
	const user = useAppSelector((state) => state.userSlice.user)
	const groups = useAppSelector((state) => state.groupsSlice.groups)
	const selectedEvent = useAppSelector((state) => state.eventsSlice.selectedEvent)

	const groupsFiltered = useMemo(() => {
		return groups.filter((group) => group.events.length > 0)
	}, [groups])

	const changeSelectedEvent = (event: SelectedEvent | null) => {
		dispatch(handleSelectedEvent(event))
	}

	return (
		<View>
			<EventModal event={selectedEvent} handleClose={() => changeSelectedEvent(null)} />
			<Box mt='2' flexDir='row' justifyContent='space-between' alignItems='center'>
				<Text numberOfLines={1} width='5/6' fontSize='2xl' bold>
					Events
				</Text>
				<Box alignItems='flex-end' width='1/6'>
					<TouchableOpacity onPress={() => {}}>
						<MaterialIcons name='more-vert' size={25} color='white' />
					</TouchableOpacity>
				</Box>
			</Box>
			<Box mt='7'>
				<ScrollView h='95%'>
					{groupsFiltered.map((group) => {
						const eventsSorted = [...group.events].sort((a, b) => a.createdAt - b.createdAt)

						return (
							<Box key={group.id} mt='2'>
								<Text fontSize='lg' bold>
									{group.name}
								</Text>
								<Box>
									{eventsSorted.map((event, i) => (
										<EventCard
											key={i}
											event={event}
											handlePress={() => {
												changeSelectedEvent({
													...event,
													groupId: group.id,
													isAdmin: group.admins.includes(user?.uid ?? '')
												})
											}}
										/>
									))}
								</Box>
							</Box>
						)
					})}
				</ScrollView>
			</Box>
			<CreateEventButton />
		</View>
	)
}

const CreateEventButton = () => {
	const router = useRouter()

	return (
		<Fab
			renderInPortal={false}
			shadow={2}
			width='12'
			onPress={() => {
				router.push(routes.createEvent)
			}}
			height='12'
			icon={<Icon color='white' as={AntDesign} name='plus' size='sm' />}
		/>
	)
}
