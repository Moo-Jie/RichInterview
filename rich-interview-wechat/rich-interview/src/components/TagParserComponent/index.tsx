import { View, Text } from '@tarojs/components'
import './index.scss'

export default ({ tagList }: { tagList: string[] }) => {
  const getColor = (tag: string) => {
    switch(tag) {
      case '简单': return '#52c41a';
      case '普通': return '#faad14';
      case '困难': return '#ff4d4f';
      default: return '#ffffff';
    }
  }

  return (
    <View className="tag-container">
      {tagList
        .filter(tag => tag?.trim()) // 添加空标签过滤
        .map((tag, index) => (
          <Text
            key={index}
            className="tag-item"
            style={{
              backgroundColor: getColor(tag),
              display: tag === '简单' ? 'inline-block' : 'unset'
            }}
          >
            {tag}
          </Text>
        ))}
    </View>
  )
}
