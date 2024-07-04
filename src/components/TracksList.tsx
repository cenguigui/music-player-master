import { TracksListItem } from '@/components/TracksListItem'
import { unknownTrackImageUri } from '@/constants/images'
import { useQueue } from '@/store/queue'
import { utilsStyles } from '@/styles'
import { useRef } from 'react'
import { FlatList, FlatListProps, Text, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import TrackPlayer, { Track } from 'react-native-track-player'
import { QueueControls } from './QueueControls'

import api_ikun from '@/components/utils/musicSdk/tx/api-ikun'




export type TracksListProps = Partial<FlatListProps<Track>> & {
	//以及所有来自 FlatListProps 的属性，且这些属性都是可选的。
	id: string
	tracks: Track[]
	hideQueueControls?: boolean
}

const ItemDivider = () => (
	<View style={{ ...utilsStyles.itemSeparator, marginVertical: 9, marginLeft: 60 }} />
)
export const TracksList = ({
	id,
	tracks,
	hideQueueControls = false,
	...flatlistProps
}: TracksListProps) => {
	const queueOffset = useRef(0)

	const { activeQueueId, setActiveQueueId } = useQueue()

	const handleTrackSelect = async (selectedTrack: Track) => {

	if(selectedTrack.url=='Unknown') {
	const res = await api_ikun.getMusicUrl(selectedTrack, '128k')
	selectedTrack.url = res.url

	}
		const trackIndex = tracks.findIndex((track) => track.url === selectedTrack.url)
		if (trackIndex === -1) return

		const isChangingQueue = id !== activeQueueId

		if (isChangingQueue) {
			const beforeTracks = tracks.slice(0, trackIndex)
			const afterTracks = tracks.slice(trackIndex + 1)
			await TrackPlayer.reset()

			// we construct the new queue
			await TrackPlayer.add(selectedTrack)
			// await TrackPlayer.add(afterTracks)
			// await TrackPlayer.add(beforeTracks)

			await TrackPlayer.play()

			queueOffset.current = trackIndex
			setActiveQueueId(id)
		} else {
			// const nextTrackIndex =
			// 	trackIndex - queueOffset.current < 0
			// 		? tracks.length + trackIndex - queueOffset.current
			// 		: trackIndex - queueOffset.current
			//await TrackPlayer.updateMetadataForTrack(nextTrackIndex,selectedTrack)
			// const q =await  TrackPlayer.getQueue()
      // await TrackPlayer.reset()
      // await TrackPlayer.add(q)
			// const a =	await TrackPlayer.getTrack(nextTrackIndex)
			// console.log('a-----'+JSON.stringify(a))
			// await TrackPlayer.add(a)
      // await TrackPlayer.skip(nextTrackIndex)
      await TrackPlayer.load(selectedTrack)
			// await TrackPlayer.skipToNext()
			// TrackPlayer.play()
		}
	}

	return (
		<FlatList
			data={tracks}
			contentContainerStyle={{ paddingTop: 10, paddingBottom: 128 }}
			ListHeaderComponent={
				!hideQueueControls ? (
					<QueueControls tracks={tracks} style={{ paddingBottom: 20 }} />
				) : undefined
			}
			ListFooterComponent={ItemDivider}
			ItemSeparatorComponent={ItemDivider}
			ListEmptyComponent={
				<View>
					<Text style={utilsStyles.emptyContentText}>No songs found</Text>

					<FastImage
						source={{ uri: unknownTrackImageUri, priority: FastImage.priority.normal }}
						style={utilsStyles.emptyContentImage}
					/>
				</View>
			}
			renderItem={({ item: track }) => (
				<TracksListItem track={track} onTrackSelect={handleTrackSelect} /> //将 track 和 handleTrackSelect 作为 props 传递给它。
			)}
			{...flatlistProps}
		/>
	)
}
