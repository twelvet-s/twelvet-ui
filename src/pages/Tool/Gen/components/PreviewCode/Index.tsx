import React, { useState, useEffect } from 'react'
import { Modal, Tabs, Skeleton } from 'antd'
import { getInfo } from './service'
import { system } from '@/utils/twelvet'
import styles from './styles.less'

/**
 * 字典模块数据管理
 */
const PreviewCode: React.FC<{
  info: {
    tableId: number
    visible: boolean
  }
  onClose: () => void
}> = (props) => {

  const { info, onClose } = props

  const [codeData, setCodeData] = useState<{
    'vm/java/controller.java.vm': string
    'vm/java/service.java.vm': string
    'vm/java/serviceImpl.java.vm': string
    'vm/java/mapper.java.vm': string
    'vm/xml/mapper.xml.vm': string
    'vm/java/domain.java.vm': string
    'vm/react/index.tsx.vm': string
    'vm/react/index-tree.tsx.vm': string
    'vm/react/service.ts.vm': string
    'vm/sql/sql.vm': string
  }>({
    'vm/java/controller.java.vm': '',
    'vm/java/service.java.vm': '',
    'vm/java/serviceImpl.java.vm': '',
    'vm/java/mapper.java.vm': '',
    'vm/xml/mapper.xml.vm': '',
    'vm/java/domain.java.vm': '',
    'vm/react/index.tsx.vm': '',
    'vm/react/index-tree.tsx.vm': '',
    'vm/react/service.ts.vm': '',
    'vm/sql/sql.vm': '',
  })

  const [loading, setLoading] = useState<boolean>(false)

  /**
   * 获取信息
   * @returns
   */
  const refGetInfo = async (tableId: number) => {
    try {
      setLoading(true)
      const { data } = await getInfo(tableId)

      setCodeData(data)
    } catch (e) {
      system.error(e)
    } finally {
      setLoading(false)
    }
  }

  const tabsiItems: TabsProps['items'] = [
    {
      key: '1',
      label: `Controller.java`,
      children: <>
        <pre className={styles.preCode}>
          <code>
            {codeData['vm/java/controller.java.vm']}
          </code>
        </pre>
      </>,
    },
    {
      key: '2',
      label: `Service.java`,
      children: <>
        <pre className={styles.preCode}>
          <code>

            {codeData['vm/java/service.java.vm']}

          </code>
        </pre>
      </>,
    },
    {
      key: '3',
      label: `ServiceImpl.java`,
      children: <>
        <pre className={styles.preCode}>
          <code>

            {codeData['vm/java/serviceImpl.java.vm']}

          </code>
        </pre>
      </>,
    },
    {
      key: '4',
      label: `Mapper.java`,
      children: <>
        <pre className={styles.preCode}>
          <code>

            {codeData['vm/java/mapper.java.vm']}

          </code>
        </pre>
      </>,
    },
    {
      key: '5',
      label: `Mapper.xml`,
      children: <>
        <pre className={styles.preCode}>
          <code>

            {codeData['vm/xml/mapper.xml.vm']}

          </code>
        </pre>
      </>,
    },
    {
      key: '6',
      label: `Domain.java`,
      children: <>
        <pre className={styles.preCode}>
          <code>

            {codeData['vm/java/domain.java.vm']}

          </code>
        </pre>
      </>,
    },
    {
      key: '7',
      label: codeData['vm/react/index.tsx.vm'] ? 'index.tsx' : 'index-tree.tsx',
      children: <>
        <pre className={styles.preCode}>
          <code>

            {codeData['vm/react/index.tsx.vm'] ? codeData['vm/react/index.tsx.vm'] : codeData['vm/react/index-tree.tsx.vm']}

          </code>
        </pre>
      </>,
    },
    {
      key: '8',
      label: 'service.ts',
      children: <>
        <pre className={styles.preCode}>
          <code>

            {codeData['vm/react/service.ts.vm']}

          </code>
        </pre>
      </>,
    },
    {
      key: '9',
      label: 'SQL',
      children: <>
        <pre className={styles.preCode}>
          <code>

            {codeData['vm/sql/sql.vm']}

          </code>
        </pre>
      </>,
    },
  ];

  /**
   * 初始化数据信息
   */
  useEffect(() => {
    if (info.tableId !== 0) {
      refGetInfo(info.tableId)
    }
  }, [info.tableId])

  return (
    <Modal
      title={`代码预览`}
      width={'80%'}
      open={info.visible}
      onCancel={() => {
        onClose()
      }}
      footer={null}
    >
      <Skeleton active loading={loading}>
        <Tabs
          defaultActiveKey="1"
          tabPosition='top'
          items={tabsiItems}
        />
      </Skeleton>

    </Modal>
  )

}

export default PreviewCode
