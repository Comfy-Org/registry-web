import { useListAllNodes } from "src/api/generated"

/**
 * 
 * @author: snomiao <snomiao@gmail.com>
 */
export default function CategoryPage() {
    const {data: nodes} = useListAllNodes({
        page: 1,
        limit: 100,
        sort: ['category']
    })
    return nodes?.map((node) => (
        <div key={node.id} className="p-4">
            <h1 className="text-2xl font-bold text-gray-200 mb-6">
                {node.category}
            </h1>
            <div className="flex flex-col gap-4">
                <div className="text-gray-400">{node.name}</div>
            </div>
        </div>
    ))
};