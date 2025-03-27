import { useState, useEffect, useMemo } from "react"
import { db } from "../../firebase"
import { query, orderBy, onSnapshot, collectionGroup, Timestamp } from "firebase/firestore"
import {
  ShoppingBag,
  ChevronDown,
  ChevronRight,
  User,
  Phone,
  Home,
  Calendar,
  Clock,
  RefreshCw,
  Search,
  Download,
  X,
} from "lucide-react"

const OrderManagement = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  // Search state
  const [searchTerm, setSearchTerm] = useState("")
  const [searchCategory, setSearchCategory] = useState("all")
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  useEffect(() => {
    setLoading(true)

    // Use collectionGroup to query all "orders" subcollections across all users directly
    try {
      const ordersQuery = query(collectionGroup(db, "orders"), orderBy("timestamp", "desc"))

      const unsubscribe = onSnapshot(
        ordersQuery,
        (snapshot) => {
          console.log("Orders snapshot received:", snapshot.size, "orders")
          const fetchedOrders = snapshot.docs.map((doc) => {
            const data = doc.data()
            // Handle potential timestamp issues - ensure we have a proper date
            let timestamp = null
            if (data.timestamp) {
              if (data.timestamp instanceof Timestamp) {
                timestamp = data.timestamp.toDate()
              } else if (data.timestamp.seconds) {
                // For timestamps stored as objects with seconds/nanoseconds
                timestamp = new Date(data.timestamp.seconds * 1000)
              } else {
                // Fallback for other formats
                timestamp = new Date(data.timestamp)
              }
            } else {
              timestamp = new Date() // Default if no timestamp
            }

            return {
              id: doc.id,
              // Extract parent path to get userId
              userId: doc.ref.parent.parent.id,
              ...data,
              timestamp: timestamp,
            }
          })

          setOrders(fetchedOrders)
          setLoading(false)
          setRefreshing(false)

          if (fetchedOrders.length === 0) {
            console.log("No orders found in the database")
          }
        },
        (err) => {
          console.error("Error fetching orders:", err)
          setError("Failed to load orders. Error: " + err.message)
          setLoading(false)
          setRefreshing(false)
        },
      )

      return () => unsubscribe()
    } catch (err) {
      console.error("Exception setting up orders query:", err)
      setError("Failed to set up orders query. Error: " + err.message)
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  const renderPaymentStatus = (order) => {
    let statusColor = "bg-green-500"
    let statusText = "Paid"

    switch (order.paymentMethod) {
      case "COD":
        statusColor = "bg-yellow-500"
        statusText = "Cash on Delivery"
        break
      case "PENDING":
        statusColor = "bg-red-500"
        statusText = "Pending Payment"
        break
      default:
        statusColor = "bg-green-500"
        statusText = "Paid"
    }

    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-2 flex items-center text-gray-700">
          <Clock className="w-4 h-4 mr-1 text-indigo-600" /> Payment Status
        </h4>
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full ${statusColor} mr-2`}></div>
          <p className="text-sm font-medium" style={{ color: statusColor.replace('bg-', 'text-') }}>
            {statusText}
          </p>
        </div>
        <p className="text-sm mt-2">Payment Method: {order.paymentMethod || "N/A"}</p>
        <p className="text-sm">Payment ID: {order.paymentId || "N/A"}</p>
      </div>
    )
  }
  // Filter orders based on search term and category
  const filteredOrders = useMemo(() => {
    if (!searchTerm.trim()) return orders

    return orders.filter((order) => {
      const searchLower = searchTerm.toLowerCase()

      // Search by order ID
      if (searchCategory === "orderId" || searchCategory === "all") {
        if (order.id.toLowerCase().includes(searchLower)) return true
      }

      // Search by name
      if (searchCategory === "name" || searchCategory === "all") {
        const fullName = `${order.shipping?.firstName || ""} ${order.shipping?.lastName || ""}`.toLowerCase()
        if (fullName.includes(searchLower)) return true
      }

      // Search by phone
      if (searchCategory === "phone" || searchCategory === "all") {
        if ((order.shipping?.phoneNumber || "").toLowerCase().includes(searchLower)) return true
      }

      // Search by email
      if (searchCategory === "email" || searchCategory === "all") {
        if ((order.shipping?.email || "").toLowerCase().includes(searchLower)) return true
      }

      return false
    })
  }, [orders, searchTerm, searchCategory])

  const formatDate = (date) => {
    try {
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch (e) {
      console.error("Date formatting error:", e, date)
      return "Invalid date"
    }
  }

  const formatTime = (date) => {
    try {
      return new Date(date).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (e) {
      console.error("Time formatting error:", e, date)
      return "Invalid time"
    }
  }

  const toggleOrderExpand = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null)
    } else {
      setExpandedOrder(orderId)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    // Force a re-render even though the listener will update automatically
    setOrders([])
    setTimeout(() => {
      if (refreshing) setRefreshing(false)
    }, 3000)
  }

  const exportToCSV = () => {
    // Define which orders to export (filtered or all)
    const ordersToExport = filteredOrders.length > 0 ? filteredOrders : orders

    // Create CSV headers
    const headers = [
      "Order ID",
      "Date",
      "Time",
      "Customer Name",
      "Email",
      "Phone",
      "Address",
      "City",
      "State",
      "Zip Code",
      "Total Amount",
      "Items Count",
      "Payment ID",
    ].join(",")

    // Create CSV rows
    const csvRows = ordersToExport.map((order) => {
      const row = [
        order.id,
        formatDate(order.timestamp),
        formatTime(order.timestamp),
        `${order.shipping?.firstName || ""} ${order.shipping?.lastName || ""}`,
        order.shipping?.email || "",
        order.shipping?.phoneNumber || "",
        order.shipping?.address || "",
        order.shipping?.city || "",
        order.shipping?.state || "",
        order.shipping?.zipCode || "",
        (order.amount || 0).toFixed(2),
        order.items?.length || 0,
        order.paymentId || "",
      ]

      // Escape commas in fields
      const escapedRow = row.map((field) => {
        // Convert field to string first to avoid "includes is not a function" error
        const fieldStr = field !== null && field !== undefined ? String(field) : ""

        // If field contains comma, quote, or newline, wrap it in quotes
        if (fieldStr.includes(",") || fieldStr.includes('"') || fieldStr.includes("\n")) {
          return `"${fieldStr.replace(/"/g, '""')}"`
        }
        return fieldStr
      })

      return escapedRow.join(",")
    })

    // Combine headers and rows
    const csvContent = [headers, ...csvRows].join("\n")

    // Create a blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `orders_export_${new Date().toISOString().slice(0, 10)}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const clearSearch = () => {
    setSearchTerm("")
    setSearchCategory("all")
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
        <p className="text-lg text-gray-600">Loading orders...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen p-6">
        <div className="bg-red-100 rounded-lg p-6 max-w-md text-center">
          <div className="text-red-600 mb-4">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Access Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500 mb-4">
            Make sure you're logged in with an admin account (admfouekicker@gmail.com)
          </p>
          <button onClick={handleRefresh} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <ShoppingBag className="w-6 h-6 mr-2 text-indigo-600" />
            Order Management
          </h1>
          <div className="flex items-center space-x-3">
            <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full">
              {filteredOrders.length} / {orders.length} Orders
            </span>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-600 focus:outline-none"
              title="Refresh orders"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Search and Export Controls */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                placeholder="Search orders..."
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
              {searchTerm && (
                <button onClick={clearSearch} className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <select
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
                className="block w-full md:w-auto border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 py-2 px-3"
              >
                <option value="all">All Fields</option>
                <option value="name">Name</option>
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="orderId">Order ID</option>
              </select>

              <button
                onClick={exportToCSV}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
            </div>
          </div>

          {isSearchFocused && (
            <div className="mt-2 text-xs text-gray-500">Search by name, email, phone number, or order ID</div>
          )}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-medium text-gray-700 mb-2">
              {searchTerm ? "No Orders Match Your Search" : "No Orders Found"}
            </h2>
            <p className="text-gray-500">
              {searchTerm
                ? "Try adjusting your search criteria or clear the search to see all orders."
                : "There are no orders in the system yet."}
            </p>
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Clear Search
              </button>
            )}
            {refreshing && (
              <p className="text-gray-500 mt-2">
                <span className="inline-block mr-2">Refreshing</span>
                <span className="inline-block animate-pulse">...</span>
              </p>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div
                  className="p-4 border-b bg-gray-50 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleOrderExpand(order.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-indigo-100 p-2 rounded-lg">
                      <ShoppingBag className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Order #{order.id.slice(-6)}</h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(order.timestamp)} at {formatTime(order.timestamp)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <span className="font-bold text-lg">₹{(order.amount || 0).toFixed(2)}</span>
                      <div className="text-xs text-gray-500">{order.items?.length || 0} items</div>
                    </div>
                    {expandedOrder === order.id ? (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                    {renderPaymentStatus(order)}
                  </div>
                </div>

                {expandedOrder === order.id && (
                  <div className="p-4">
                    <div className="grid md:grid-cols-3 gap-6 mb-6">
                      {/* Customer Information */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2 flex items-center text-gray-700">
                          <User className="w-4 h-4 mr-1 text-indigo-600" /> Customer
                        </h4>
                        <p className="text-sm mb-1">
                          <span className="font-medium">
                            {order.shipping?.firstName} {order.shipping?.lastName}
                          </span>
                        </p>
                        <p className="text-sm mb-1 flex items-center text-gray-600">
                          <Phone className="w-3 h-3 mr-1" /> {order.shipping?.phoneNumber || "N/A"}
                        </p>
                        <p className="text-sm text-gray-600">{order.shipping?.email || "N/A"}</p>
                      </div>

                      {/* Shipping Information */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2 flex items-center text-gray-700">
                          <Home className="w-4 h-4 mr-1 text-indigo-600" /> Shipping Address
                        </h4>
                        <p className="text-sm mb-1">{order.shipping?.address || "N/A"}</p>
                        <p className="text-sm mb-1">
                          {order.shipping?.city}
                          {order.shipping?.city && order.shipping?.state ? ", " : ""}
                          {order.shipping?.state} {order.shipping?.zipCode}
                        </p>
                      </div>

                      {/* Payment Information */}
                     
                    </div>

                    {/* Order Items */}
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 p-3 border-b">
                        <h4 className="font-medium">Order Items</h4>
                      </div>
                      <div className="divide-y">
                        {(order.items || []).map((item, index) => (
                          <div key={index} className="p-3 flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                              <img
                                src={item.image || "/vite.svg"}
                                alt={item.name}
                                className="w-12 h-12 object-cover rounded-md border"
                              />
                              <div>
                                <h5 className="font-medium">{item.name}</h5>
                                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">
                                ₹{(Number(item.price) * Number(item.quantity || 1)).toFixed(2)}
                              </p>
                              <p className="text-xs text-gray-500">₹{Number(item.price).toFixed(2)} each</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="bg-gray-50 p-3 border-t">
                        <div className="flex justify-between font-bold">
                          <span>Total Amount</span>
                          <span>₹{(order.amount || 0).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex justify-end space-x-3">
                      <a
                        href={`https://wa.me/${order.shipping?.phoneNumber}?text=Hello ${order.shipping?.firstName}, regarding your order #${order.id.slice(-6)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center"
                      >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        Contact Customer
                      </a>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          // Create a CSV for just this order
                          const singleOrderCSV = exportSingleOrderToCSV(order)
                          const blob = new Blob([singleOrderCSV], { type: "text/csv;charset=utf-8;" })
                          const url = URL.createObjectURL(blob)
                          const link = document.createElement("a")
                          link.setAttribute("href", url)
                          link.setAttribute("download", `order_${order.id.slice(-6)}.csv`)
                          link.style.visibility = "hidden"
                          document.body.appendChild(link)
                          link.click()
                          document.body.removeChild(link)
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        Export Order
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Helper function to export a single order to CSV
function exportSingleOrderToCSV(order) {
  // Order details header
  const orderHeader = [
    "Order ID",
    "Date",
    "Time",
    "Customer Name",
    "Email",
    "Phone",
    "Address",
    "City",
    "State",
    "Zip Code",
    "Total Amount",
    "Payment ID",
  ].join(",")

  // Format date and time
  const formatDate = (date) => {
    try {
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch (e) {
      return "Invalid date"
    }
  }

  const formatTime = (date) => {
    try {
      return new Date(date).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (e) {
      return "Invalid time"
    }
  }

  // Order details row
  const orderRow = [
    order.id,
    formatDate(order.timestamp),
    formatTime(order.timestamp),
    `${order.shipping?.firstName || ""} ${order.shipping?.lastName || ""}`,
    order.shipping?.email || "",
    order.shipping?.phoneNumber || "",
    order.shipping?.address || "",
    order.shipping?.city || "",
    order.shipping?.state || "",
    order.shipping?.zipCode || "",
    (order.amount || 0).toFixed(2),
    order.paymentId || "",
  ]
    .map((field) => {
      // Convert field to string first
      const fieldStr = field !== null && field !== undefined ? String(field) : ""

      // Escape commas in fields
      if (fieldStr.includes(",") || fieldStr.includes('"') || fieldStr.includes("\n")) {
        return `"${fieldStr.replace(/"/g, '""')}"`
      }
      return fieldStr
    })
    .join(",")

  // Items header
  const itemsHeader = ["Item Name", "Quantity", "Price Each", "Total Price"].join(",")

  // Items rows
  const itemsRows = (order.items || []).map((item) => {
    const row = [
      item.name || "",
      item.quantity || 1,
      Number(item.price).toFixed(2),
      (Number(item.price) * Number(item.quantity || 1)).toFixed(2),
    ]
      .map((field) => {
        // Convert field to string first
        const fieldStr = field !== null && field !== undefined ? String(field) : ""

        // Escape commas in fields
        if (fieldStr.includes(",") || fieldStr.includes('"') || fieldStr.includes("\n")) {
          return `"${fieldStr.replace(/"/g, '""')}"`
        }
        return fieldStr
      })
      .join(",")

    return row
  })

  // Combine all parts
  return ["ORDER DETAILS", orderHeader, orderRow, "", "ORDER ITEMS", itemsHeader, ...itemsRows].join("\n")
}

export default OrderManagement

