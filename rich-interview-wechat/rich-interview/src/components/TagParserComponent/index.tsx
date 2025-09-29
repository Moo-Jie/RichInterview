import { View, Text } from '@tarojs/components'
import './index.scss'

export default ({ tagList }: { tagList: string[] }) => {
  const getColor = (tag: string) => {
    switch(tag) {
      case '简单': return '#52c41a';
      case '普通': return '#faad14';
      case '困难': return '#ff4d4f';
      default: return '#1890ff'; // 为其他标签设置蓝色背景
    }
  }

  return (
    <View className="tag-container">
      {tagList
        .filter(tag => tag?.trim())
        .map((tag, index) => (
          <Text
            key={index}
            className="tag-item"
            style={{
              backgroundColor: getColor(tag)
            }}
          >
            {tag}
          </Text>
        ))}
    </View>
  )
}
