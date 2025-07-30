/* eslint-disable @typescript-eslint/no-explicit-any */
export function findParentKeys(
  tree: any[],
  targetKeys: React.Key[]
): (string | number)[] {
  const parentSet = new Set<string | number>()

  function dfs(nodes: any[], currentPath: (string | number)[]): void {
    for (const node of nodes) {
      const newPath = [...currentPath, node.key]

      if (targetKeys.includes(node.key)) {
        newPath.slice(0, -1).forEach((key) => parentSet.add(key))
      }

      if (node.children && node.children.length > 0) {
        dfs(node.children, newPath as any)
      }
    }
  }

  dfs(tree, [])
  return Array.from(parentSet)
}
