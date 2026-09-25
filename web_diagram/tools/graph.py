# Part of Odoo. See LICENSE file for full copyright and licensing details.
# Ported from Odoo 13 odoo/tools/graph.py (removed in Odoo 14).

import math
import operator


class graph(object):
    def __init__(self, nodes, transitions, no_ancester=None):
        """Initialize graph's object.

        @param nodes list of ids of nodes in the graph
        @param transitions list of edges in the graph in the form
            (source_node, destination_node)
        @param no_ancester list of nodes with no incoming edges
        """
        self.nodes = nodes or []
        self.edges = transitions or []
        self.no_ancester = no_ancester or {}
        trans = {}

        for t in transitions:
            trans.setdefault(t[0], [])
            trans[t[0]].append(t[1])
        self.transitions = trans
        self.result = {}

    def init_rank(self):
        """Compute rank of the nodes of the graph by finding initial
        feasible tree.
        """
        self.edge_wt = {}
        for link in self.links:
            self.edge_wt[link] = (
                self.result[link[1]]["x"] - self.result[link[0]]["x"]
            )

        tot_node = len(self.partial_order)
        # Do until all the nodes in the component are searched.
        while self.tight_tree() < tot_node:
            list_node = []
            list_edge = []

            for node in self.nodes:
                if node not in self.reachable_nodes:
                    list_node.append(node)

            for edge in self.edge_wt:
                if edge not in self.tree_edges:
                    list_edge.append(edge)

            slack = 100

            for edge in list_edge:
                if (
                    edge[0] in self.reachable_nodes
                    and edge[1] not in self.reachable_nodes
                ) or (
                    edge[1] in self.reachable_nodes
                    and edge[0] not in self.reachable_nodes
                ):
                    if slack > self.edge_wt[edge] - 1:
                        slack = self.edge_wt[edge] - 1
                        new_edge = edge

            if new_edge[0] not in self.reachable_nodes:
                delta = -(self.edge_wt[new_edge] - 1)
            else:
                delta = self.edge_wt[new_edge] - 1

            for node in self.result:
                if node in self.reachable_nodes:
                    self.result[node]["x"] += delta

            for edge in self.edge_wt:
                self.edge_wt[edge] = (
                    self.result[edge[1]]["x"] - self.result[edge[0]]["x"]
                )

        self.init_cutvalues()

    def tight_tree(self):
        self.reachable_nodes = []
        self.tree_edges = []
        self.reachable_node(self.start)
        return len(self.reachable_nodes)

    def reachable_node(self, node):
        """Find the nodes of the graph which are only 1 rank apart from
        each other.
        """
        if node not in self.reachable_nodes:
            self.reachable_nodes.append(node)
        for edge in self.edge_wt:
            if edge[0] == node:
                if self.edge_wt[edge] == 1:
                    self.tree_edges.append(edge)
                    if edge[1] not in self.reachable_nodes:
                        self.reachable_nodes.append(edge[1])
                    self.reachable_node(edge[1])

    def init_cutvalues(self):
        """Initialize cut values of edges of the feasible tree.

        Edges with negative cut-values are removed from the tree to
        optimize rank assignment.
        """
        self.cut_edges = {}
        self.head_nodes = []
        i = 0

        for edge in self.tree_edges:
            self.head_nodes = []
            rest_edges = []
            rest_edges += self.tree_edges
            del rest_edges[i]
            self.head_component(self.start, rest_edges)
            i += 1
            positive = 0
            negative = 0
            for source_node in self.transitions:
                if source_node in self.head_nodes:
                    for dest_node in self.transitions[source_node]:
                        if dest_node not in self.head_nodes:
                            negative += 1
                else:
                    for dest_node in self.transitions[source_node]:
                        if dest_node in self.head_nodes:
                            positive += 1

            self.cut_edges[edge] = positive - negative

    def head_component(self, node, rest_edges):
        """Find nodes which are reachable from the starting node, after
        removing an edge.
        """
        if node not in self.head_nodes:
            self.head_nodes.append(node)

            for edge in rest_edges:
                if edge[0] == node:
                    self.head_component(edge[1], rest_edges)

    def process_ranking(self, node, level=0):
        """Compute initial feasible ranking after making graph acyclic
        with depth-first search.
        """
        if node not in self.result:
            self.result[node] = {"y": None, "x": level, "mark": 0}
        else:
            if level > self.result[node]["x"]:
                self.result[node]["x"] = level

        if self.result[node]["mark"] == 0:
            self.result[node]["mark"] = 1
            for sec_end in self.transitions.get(node, []):
                self.process_ranking(sec_end, level + 1)

    def make_acyclic(self, parent, node, level, tree):
        """Compute Partial-order of the nodes with depth-first search."""
        if node not in self.partial_order:
            self.partial_order[node] = {"level": level, "mark": 0}
            if parent:
                tree.append((parent, node))

        if self.partial_order[node]["mark"] == 0:
            self.partial_order[node]["mark"] = 1
            for sec_end in self.transitions.get(node, []):
                self.links.append((node, sec_end))
                self.make_acyclic(node, sec_end, level + 1, tree)

        return tree

    def rev_edges(self, tree):
        """Reverse the direction of edges whose source partial_order >
        destination partial_order, to make the graph acyclic.
        """
        Is_Cyclic = False
        i = 0
        for link in self.links:
            src = link[0]
            des = link[1]
            edge_len = (
                self.partial_order[des]["level"]
                - self.partial_order[src]["level"]
            )
            if edge_len < 0:
                del self.links[i]
                self.links.insert(i, (des, src))
                self.transitions[src].remove(des)
                self.transitions.setdefault(des, []).append(src)
                Is_Cyclic = True
            elif math.fabs(edge_len) > 1:
                Is_Cyclic = True
            i += 1

        return Is_Cyclic

    def exchange(self, e, f):
        """Exchange edges to make feasible-tree optimized.

        :param e: edge with negative cut-value
        :param f: new edge with minimum slack-value
        """
        del self.tree_edges[self.tree_edges.index(e)]
        self.tree_edges.append(f)
        self.init_cutvalues()

    def enter_edge(self, edge):
        """Find a new_edge with minimum slack value to replace an edge
        with negative cut-value.

        @param edge edge with negative cut-value
        """
        self.head_nodes = []
        rest_edges = []
        rest_edges += self.tree_edges
        del rest_edges[rest_edges.index(edge)]
        self.head_component(self.start, rest_edges)

        if edge[1] in self.head_nodes:
            l = []
            for node in self.result:
                if node not in self.head_nodes:
                    l.append(node)
            self.head_nodes = l

        slack = 100
        new_edge = edge
        for source_node in self.transitions:
            if source_node in self.head_nodes:
                for dest_node in self.transitions[source_node]:
                    if dest_node not in self.head_nodes:
                        if slack > (self.edge_wt[edge] - 1):
                            slack = self.edge_wt[edge] - 1
                            new_edge = (source_node, dest_node)

        return new_edge

    def leave_edge(self):
        """Return the edge with negative cut_value (if exists)."""
        if self.critical_edges:
            for edge in self.critical_edges:
                self.cut_edges[edge] = 0

        for edge in self.cut_edges:
            if self.cut_edges[edge] < 0:
                return edge

        return None

    def finalize_rank(self, node, level):
        self.result[node]["x"] = level
        for destination in self.optimal_edges.get(node, []):
            self.finalize_rank(destination, level + 1)

    def normalize(self):
        """Normalize ranks by setting the least rank to zero."""
        least_rank = min(x["x"] for x in self.result.values())

        if least_rank != 0:
            for node in self.result:
                self.result[node]["x"] -= least_rank

    def make_chain(self):
        """Replace edges between nodes more than one rank apart with
        chains of unit length edges between temporary nodes.
        """
        for edge in self.edge_wt:
            if self.edge_wt[edge] > 1:
                self.transitions[edge[0]].remove(edge[1])
                start = self.result[edge[0]]["x"]
                end = self.result[edge[1]]["x"]

                for rank in range(start + 1, end):
                    if not self.result.get((rank, "temp"), False):
                        self.result[(rank, "temp")] = {
                            "y": None,
                            "x": rank,
                            "mark": 0,
                        }

                for rank in range(start, end):
                    if start == rank:
                        self.transitions[edge[0]].append((rank + 1, "temp"))
                    elif rank == end - 1:
                        self.transitions.setdefault(
                            (rank, "temp"), []
                        ).append(edge[1])
                    else:
                        self.transitions.setdefault(
                            (rank, "temp"), []
                        ).append((rank + 1, "temp"))

    def init_order(self, node, level):
        """Initialize orders of the nodes in each rank with
        depth-first search.
        """
        if self.result[node]["y"] is None:
            self.result[node]["y"] = self.order[level]
            self.order[level] += 1

        for sec_end in self.transitions.get(node, []):
            if node != sec_end:
                self.init_order(sec_end, self.result[sec_end]["x"])

    def order_heuristic(self):
        for i in range(12):
            self.wmedian()

    def wmedian(self):
        """Apply median heuristic to find optimized order of nodes
        within their ranks.
        """
        for level in self.levels:
            node_median = []
            nodes = self.levels[level]
            for node in nodes:
                node_median.append((node, self.median_value(node, level - 1)))

            sort_list = sorted(node_median, key=operator.itemgetter(1))

            new_list = [tuple[0] for tuple in sort_list]

            self.levels[level] = new_list
            order = 0
            for node in nodes:
                self.result[node]["y"] = order
                order += 1

    def median_value(self, node, adj_rank):
        """Return median value of a vertex, defined as the median
        position of the adjacent vertices.

        @param node node to process
        @param adj_rank rank 1 less than the node's rank
        """
        adj_nodes = self.adj_position(node, adj_rank)
        l = len(adj_nodes)
        m = l // 2

        if l == 0:
            return -1.0
        elif l % 2 == 1:
            return adj_nodes[m]  # median of the middle element
        elif l == 2:
            return (adj_nodes[0] + adj_nodes[1]) / 2
        else:
            left = adj_nodes[m - 1] - adj_nodes[0]
            right = adj_nodes[l - 1] - adj_nodes[m]
            return ((adj_nodes[m - 1] * right) + (adj_nodes[m] * left)) / (
                left + right
            )

    def adj_position(self, node, adj_rank):
        """Return list of present positions of nodes adjacent to node
        in the given adjacent rank.

        @param node node to process
        @param adj_rank rank 1 less than the node's rank
        """
        pre_level_nodes = self.levels.get(adj_rank, [])
        adj_nodes = []

        if pre_level_nodes:
            for src in pre_level_nodes:
                if self.transitions.get(src) and node in self.transitions[src]:
                    adj_nodes.append(self.result[src]["y"])

        return adj_nodes

    def preprocess_order(self):
        levels = {}

        for r in self.partial_order:
            l = self.result[r]["x"]
            levels.setdefault(l, [])
            levels[l].append(r)

        self.levels = levels

    def graph_order(self):
        """Find actual-order of nodes with respect to maximum number of
        nodes in a rank in component.
        """
        mid_pos = 0.0
        max_level = max(len(x) for x in self.levels.values())

        for level in self.levels:
            if level:
                no = len(self.levels[level])
                factor = (max_level - no) * 0.10
                list = self.levels[level]
                list.reverse()

                if no % 2 == 0:
                    first_half = list[no // 2:]
                    factor = -factor
                else:
                    first_half = list[no // 2 + 1:]
                    if max_level == 1:  # horizontal graph edge case
                        self.result[list[no // 2]]["y"] = mid_pos + (
                            self.result[list[no // 2]]["x"] % 2 * 0.5
                        )
                    else:
                        self.result[list[no // 2]]["y"] = mid_pos + factor

                last_half = list[: no // 2]

                i = 1
                for node in first_half:
                    self.result[node]["y"] = mid_pos - (i + factor)
                    i += 1

                i = 1
                for node in last_half:
                    self.result[node]["y"] = mid_pos + (i + factor)
                    i += 1
            else:
                self.max_order += max_level + 1
                mid_pos = self.result[self.start]["y"]

    def tree_order(self, node, last=0):
        mid_pos = self.result[node]["y"]
        l = self.transitions.get(node, [])
        l.reverse()
        no = len(l)

        rest = no % 2
        first_half = l[no // 2 + rest:]
        last_half = l[: no // 2]

        for i, child in enumerate(first_half):
            self.result[child]["y"] = mid_pos - (i + 1 - (0 if rest else 0.5))

            if self.transitions.get(child, False):
                if last:
                    self.result[child]["y"] = (
                        last + len(self.transitions[child]) / 2 + 1
                    )
                last = self.tree_order(child, last)

        if rest:
            mid_node = l[no // 2]
            self.result[mid_node]["y"] = mid_pos

            if self.transitions.get(mid_node, False):
                if last:
                    self.result[mid_node]["y"] = (
                        last + len(self.transitions[mid_node]) / 2 + 1
                    )
                if node != mid_node:
                    last = self.tree_order(mid_node)
            else:
                if last:
                    self.result[mid_node]["y"] = last + 1
            self.result[node]["y"] = self.result[mid_node]["y"]
            mid_pos = self.result[node]["y"]

        i = 1
        last_child = None
        for child in last_half:
            self.result[child]["y"] = mid_pos + (i - (0 if rest else 0.5))
            last_child = child
            i += 1
            if self.transitions.get(child, False):
                if last:
                    self.result[child]["y"] = (
                        last + len(self.transitions[child]) / 2 + 1
                    )
                if node != child:
                    last = self.tree_order(child, last)

        if last_child:
            last = self.result[last_child]["y"]

        return last

    def process_order(self):
        """Find actual-order of nodes with respect to maximum number of
        nodes in a rank in component.
        """
        if self.Is_Cyclic:
            max_level = max(len(x) for x in self.levels.values())

            if max_level % 2:
                self.result[self.start]["y"] = (
                    (max_level + 1) / 2
                    + self.max_order
                    + (self.max_order and 1)
                )
            else:
                self.result[self.start]["y"] = (
                    max_level / 2 + self.max_order + (self.max_order and 1)
                )

            self.graph_order()

        else:
            self.result[self.start]["y"] = 0
            self.tree_order(self.start, 0)
            min_order = math.fabs(min(x["y"] for x in self.result.values()))

            index = self.start_nodes.index(self.start)
            same = False

            roots = []
            if index > 0:
                for start in self.start_nodes[:index]:
                    same = True
                    for edge in self.tree_list[start][1:]:
                        if edge in self.tree_list[self.start]:
                            continue
                        else:
                            same = False
                            break
                    if same:
                        roots.append(start)

            if roots:
                min_order += self.max_order
            else:
                min_order += self.max_order + 1

            for level in self.levels:
                for node in self.levels[level]:
                    self.result[node]["y"] += min_order

            if roots and self.tree_list[self.start]:
                roots.append(self.start)
                one_level_el = self.tree_list[self.start][0][1]
                base = self.result[one_level_el]["y"]

                no = len(roots)
                first_half = roots[: no // 2]

                if no % 2 == 0:
                    last_half = roots[no // 2:]
                else:
                    last_half = roots[no // 2 + 1:]

                factor = -math.floor(no // 2)
                for start in first_half:
                    self.result[start]["y"] = base + factor
                    factor += 1

                if no % 2:
                    self.result[roots[no // 2]]["y"] = base + factor
                factor += 1

                for start in last_half:
                    self.result[start]["y"] = base + factor
                    factor += 1

            self.max_order = max(x["y"] for x in self.result.values())

    def find_starts(self):
        """Find other start nodes of the graph when graph is
        disconnected.
        """
        rem_nodes = []
        for node in self.nodes:
            if not self.partial_order.get(node):
                rem_nodes.append(node)
        while True:
            if len(rem_nodes) == 1:
                if rem_nodes[0] not in self.start_nodes:
                    self.start_nodes.append(rem_nodes[0])
                break
            else:
                count = 0
                new_start = rem_nodes[0]
                largest_tree = []

                for node in rem_nodes:
                    self.partial_order = {}
                    tree = self.make_acyclic(None, node, 0, [])
                    if len(tree) + 1 > count:
                        count = len(tree) + 1
                        new_start = node
                        largest_tree = tree
                else:
                    if not largest_tree:
                        new_start = rem_nodes[0]
                        rem_nodes.remove(new_start)

                if new_start not in self.start_nodes:
                    self.start_nodes.append(new_start)

                for edge in largest_tree:
                    if edge[0] in rem_nodes:
                        rem_nodes.remove(edge[0])
                    if edge[1] in rem_nodes:
                        rem_nodes.remove(edge[1])

                if not rem_nodes:
                    break

    def rank(self):
        """Find the optimized rank of nodes using Network-simplex
        algorithm.
        """
        self.levels = {}
        self.critical_edges = []
        self.partial_order = {}
        self.links = []
        self.Is_Cyclic = False

        self.tree_list[self.start] = self.make_acyclic(
            None, self.start, 0, []
        )
        self.Is_Cyclic = self.rev_edges(self.tree_list[self.start])
        self.process_ranking(self.start)
        self.init_rank()

        e = self.leave_edge()

        while e:
            f = self.enter_edge(e)
            if e == f:
                self.critical_edges.append(e)
            else:
                self.exchange(e, f)
            e = self.leave_edge()

        self.normalize()
        for edge in self.edge_wt:
            self.edge_wt[edge] = (
                self.result[edge[1]]["x"] - self.result[edge[0]]["x"]
            )

    def order_in_rank(self):
        """Find optimized order of nodes within their ranks using
        median heuristic.
        """
        self.make_chain()
        self.preprocess_order()
        self.order = {}
        max_rank = max(x for x in self.levels)

        for i in range(max_rank + 1):
            self.order[i] = 0

        self.init_order(self.start, self.result[self.start]["x"])

        for level in self.levels:
            self.levels[level].sort(key=lambda x: self.result[x]["y"])

        self.order_heuristic()
        self.process_order()

    def process(self, starting_node):
        """Process the graph to find ranks and order of the nodes.

        @param starting_node node from where to start the graph search
        """
        self.start_nodes = starting_node or []
        self.partial_order = {}
        self.links = []
        self.tree_list = {}

        if self.nodes:
            if self.start_nodes:
                # Traverse ALL provided start nodes so that partial_order
                # covers every start node's subtree before find_starts runs.
                # Without this, only start_nodes[0] was covered, causing
                # find_starts to re-add the other flow_start nodes as new
                # starts, resulting in duplicate processing and scrambled
                # y-coordinates for multi-root forests.
                for sn in self.start_nodes:
                    self.make_acyclic(None, sn, 0, [])

                for node in self.no_ancester:
                    for sec_node in self.transitions.get(node, []):
                        if sec_node in self.partial_order:
                            self.transitions[self.start_nodes[0]].append(node)
                            break

                self.partial_order = {}
                for sn in self.start_nodes:
                    self.make_acyclic(None, sn, 0, [])

            if len(self.nodes) > len(self.partial_order):
                self.find_starts()

            self.max_order = 0
            for s in self.start_nodes:
                self.start = s
                self.rank()
                self.order_in_rank()

    def __str__(self):
        result = ""
        for l in self.levels:
            result += "PosY: " + str(l) + "\n"
            for node in self.levels[l]:
                result += (
                    "\tPosX: "
                    + str(self.result[node]["y"])
                    + "  - Node:"
                    + str(node)
                    + "\n"
                )
        return result

    def scale(self, maxx, maxy, nwidth=0, nheight=0, margin=20):
        """Compute actual coordinates of the nodes."""
        for src in self.transitions:
            for des in self.transitions[src]:
                if self.result[des]["x"] - self.result[src]["x"] == 0:
                    self.result[src]["x"] += 0.08
                    self.result[des]["x"] -= 0.08

        factorX = maxx + nheight
        factorY = maxy + nwidth

        for node in self.result:
            self.result[node]["y"] = (self.result[node]["y"]) * factorX + margin
            self.result[node]["x"] = (self.result[node]["x"]) * factorY + margin

    def result_get(self):
        return self.result
