import Link from 'next/link'
import { useState } from 'react'
import {
  HiChevronDown,
  HiChevronRight,
  HiOutlineAdjustments,
  HiOutlineClipboardCheck,
  HiOutlineCollection,
  HiOutlineCube,
  HiOutlineDuplicate,
  HiOutlineSupport,
} from 'react-icons/hi'
import { useNextTranslation } from '@/src/hooks/i18n'

interface TreeNode {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  href?: string
  children?: TreeNode[]
  expanded?: boolean
}

interface AdminTreeNavigationProps {
  className?: string
}

export default function AdminTreeNavigation({
  className,
}: AdminTreeNavigationProps) {
  const { t } = useNextTranslation()

  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
    new Set(['nodes', 'nodeversions'])
  )

  const treeData: TreeNode[] = [
    {
      id: 'nodes',
      label: t('Nodes'),
      icon: HiOutlineCube,
      children: [
        {
          id: 'manage-nodes',
          label: t('Manage Nodes'),
          icon: HiOutlineCollection,
          href: '/admin/nodes',
        },
        {
          id: 'unclaimed-nodes',
          label: t('Unclaimed Nodes'),
          icon: HiOutlineCollection,
          href: '/admin/claim-nodes',
        },
        {
          id: 'add-unclaimed-node',
          label: t('Add Unclaimed Node'),
          icon: HiOutlineCollection,
          href: '/admin/add-unclaimed-node',
        },
      ],
    },
    {
      id: 'search-ranking',
      label: t('Search Ranking Table'),
      icon: HiOutlineAdjustments,
      href: '/admin/search-ranking',
    },
    {
      id: 'comfy-node-names',
      label: t('ComfyNode Names'),
      icon: HiOutlineDuplicate,
      href: '/admin/preempted-comfy-node-names',
    },
    {
      id: 'nodeversions',
      label: t('Node Versions'),
      icon: HiOutlineClipboardCheck,
      children: [
        {
          id: 'review-versions',
          label: t('Review Node Versions'),
          icon: HiOutlineClipboardCheck,
          href: '/admin/nodeversions?filter=flagged',
        },
        {
          id: 'version-compatibility',
          label: t('Version Compatibility'),
          icon: HiOutlineSupport,
          href: '/admin/node-version-compatibility',
        },
      ],
    },
  ]

  const toggleExpanded = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  const renderTreeNode = (node: TreeNode, depth = 0) => {
    const hasChildren = node.children && node.children.length > 0
    const isExpanded = expandedNodes.has(node.id)
    const paddingLeft = depth * 20 + 12

    return (
      <div key={node.id} className="w-full">
        <div
          className={`flex items-center w-full px-3 py-2 rounded-lg transition-colors ${
            node.href
              ? 'hover:bg-gray-700 text-gray-200 hover:text-white'
              : 'text-gray-300'
          }`}
          style={{ paddingLeft: `${paddingLeft}px` }}
        >
          {hasChildren && (
            <button
              onClick={() => toggleExpanded(node.id)}
              className="flex items-center justify-center w-4 h-4 mr-2 text-gray-400 hover:text-gray-200"
            >
              {isExpanded ? (
                <HiChevronDown className="w-3 h-3" />
              ) : (
                <HiChevronRight className="w-3 h-3" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-6 mr-2" />}

          <node.icon className="w-4 h-4 mr-3 flex-shrink-0" />

          {node.href ? (
            <Link href={node.href} className="flex-1 text-left">
              {node.label}
            </Link>
          ) : (
            <span
              className={`flex-1 text-left ${hasChildren ? 'cursor-pointer' : ''}`}
              onClick={() => hasChildren && toggleExpanded(node.id)}
            >
              {node.label}
            </span>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="ml-2">
            {node.children?.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <nav className={`bg-gray-800 rounded-lg p-4 ${className || ''}`}>
      <h2 className="text-lg font-semibold text-gray-200 mb-4">
        {t('Admin Navigation')}
      </h2>
      <div className="space-y-1">
        {treeData.map((node) => renderTreeNode(node))}
      </div>
    </nav>
  )
}
