import React, { useContext, useMemo } from "react";
import { ShopContext } from "../context/ShopContext";
import { motion } from "framer-motion";
import Title from "../components/Title";
import PropTypes from "prop-types";
import {
  ShoppingCartIcon,
  DollarSignIcon,
  UsersIcon,
  PackageIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  RefreshCwIcon,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";

// Komponen StatCard
const StatCard = ({ title, value, icon, trend }) => {
  const iconMap = {
    order: ShoppingCartIcon,
    revenue: DollarSignIcon,
    users: UsersIcon,
    products: PackageIcon,
  };

  const Icon = iconMap[icon];
  const isPositive = trend > 0;

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-white shadow-md rounded-xl p-6 hover:shadow-lg transition-all"
    >
      <div className="flex justify-between items-center">
        <div className="bg-blue-50 p-3 rounded-full">
          <Icon className="text-blue-500" size={24} />
        </div>
        <div className="flex items-center">
          {isPositive ? (
            <TrendingUpIcon className="text-green-500 mr-2" size={20} />
          ) : (
            <TrendingDownIcon className="text-red-500 mr-2" size={20} />
          )}
          <span
            className={`font-semibold ${
              isPositive ? "text-green-500" : "text-red-500"
            }`}
          >
            {trend}%
          </span>
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-gray-500 text-sm mb-1">{title}</h3>
        <p className="text-xl font-medium text-gray-900">{value}</p>
      </div>
    </motion.div>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.oneOf(["order", "revenue", "users", "products"]).isRequired,
  trend: PropTypes.number.isRequired,
};

// Revenue Chart dengan Area
const RevenueChart = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Monthly Revenue Trend
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="month" />
          <YAxis />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#3B82F6"
            fillOpacity={1}
            fill="url(#colorRevenue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

RevenueChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      month: PropTypes.string.isRequired,
      revenue: PropTypes.number.isRequired,
    })
  ).isRequired,
};

// Order Status Chart
const OrderStatusChart = ({ orders }) => {
  const statusData = useMemo(() => {
    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count,
    }));
  }, [orders]);

  const COLORS = {
    Completed: "#10B981",
    Pending: "#F59E0B",
    Cancelled: "#DC2626",
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Order Status Distribution
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={statusData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {statusData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[entry.name] || "#8884D8"}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

OrderStatusChart.propTypes = {
  orders: PropTypes.arrayOf(
    PropTypes.shape({
      status: PropTypes.string.isRequired,
    })
  ).isRequired,
};

// Sales Performance Line Chart
const SalesPerformanceChart = ({ products, orders }) => {
  const salesData = useMemo(() => {
    // Hitung total penjualan per produk
    const productSales = orders.reduce((acc, order) => {
      order.items.forEach((item) => {
        const product = products.find((p) => p._id === item.productId);
        if (product) {
          acc[product.name] =
            (acc[product.name] || 0) + item.quantity * product.price;
        }
      });
      return acc;
    }, {});

    // Konversi ke format chart
    return Object.entries(productSales)
      .map(([name, sales]) => ({ name, sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  }, [products, orders]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Top Product Sales Performance
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={salesData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="sales"
            stroke="#8B5CF6"
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

SalesPerformanceChart.propTypes = {
  products: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
    })
  ).isRequired,
  orders: PropTypes.arrayOf(
    PropTypes.shape({
      items: PropTypes.arrayOf(
        PropTypes.shape({
          productId: PropTypes.string.isRequired,
          quantity: PropTypes.number.isRequired,
        })
      ).isRequired,
    })
  ).isRequired,
};

// Top Products Chart
const TopProductsChart = ({ data }) => {
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Top Selling Products
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="sales"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

TopProductsChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      sales: PropTypes.number.isRequired,
    })
  ).isRequired,
};

// Orders Table
// const OrdersTable = ({ orders }) => {
//   return (
//     <div className="bg-white p-6 rounded-xl shadow-md">
//       <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
//       <div className="overflow-x-auto">
//         <table className="lg:w-full w-1/2">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="px-4 py-2 text-left">Order ID</th>
//               <th className="px-4 py-2 text-left">Customer</th>
//               <th className="px-4 py-2 text-left">Total</th>
//               <th className="px-4 py-2 text-left">Status</th>
//             </tr>
//           </thead>
//           <tbody>
//             {orders.map((order) => (
//               <tr key={order._id} className="border-b">
//                 <td className="px-4 py-2">{order._id}</td>
//                 <td className="px-4 py-2">{order.user?.name || "Unknown"}</td>
//                 <td className="px-4 py-2">{order.totalAmount}</td>
//                 <td className="px-4 py-2">
//                   <span
//                     className={`
//                       px-3 py-1 rounded-full text-xs
//                       ${
//                         order.status === "Completed"
//                           ? "bg-green-200 text-green-800"
//                           : order.status === "Pending"
//                           ? "bg-yellow-200 text-yellow-800"
//                           : "bg-red-200 text-red-800"
//                       }
//                     `}
//                   >
//                     {order.status}
//                   </span>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// OrdersTable.propTypes = {
//   orders: PropTypes.arrayOf(
//     PropTypes.shape({
//       _id: PropTypes.string.isRequired,
//       user: PropTypes.shape({
//         name: PropTypes.string,
//       }),
//       totalAmount: PropTypes.number.isRequired,
//       status: PropTypes.oneOf(["Completed", "Pending", "Cancelled"]).isRequired,
//     })
//   ).isRequired,
// };

// Dashboard Utama
const Dashboard = () => {
  const { products, orders, currency } = useContext(ShopContext);

  // Data Revenue Chart
  const revenueData = useMemo(() => {
    // Pastikan orders adalah array
    const safeOrders = Array.isArray(orders) ? orders : [];

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Kelompokkan orders berdasarkan bulan
    const monthlyRevenue = safeOrders.reduce((acc, order) => {
      // Pastikan order memiliki createdAt dan totalAmount
      if (!order.createdAt || !order.totalAmount) return acc;

      const month = new Date(order.createdAt).getMonth();
      const monthName = monthNames[month];

      if (!acc[monthName]) {
        acc[monthName] = 0;
      }
      acc[monthName] += order.totalAmount;
      return acc;
    }, {});

    // Konversi ke array dengan default 0 untuk bulan tanpa transaksi
    return monthNames.map((month) => ({
      month,
      revenue: monthlyRevenue[month] || 0,
    }));
  }, [orders]);

  // Data Top Products
  const topProductsData = useMemo(() => {
    // Pastikan orders adalah array
    const safeOrders = Array.isArray(orders) ? orders : [];

    // Hitung jumlah penjualan per produk dari orders
    const productSales = safeOrders.reduce((acc, order) => {
      // Pastikan order memiliki items
      if (!order.items || !Array.isArray(order.items)) return acc;

      order.items.forEach((item) => {
        const product = products.find((p) => p._id === item.productId);
        if (product) {
          if (!acc[product.name]) {
            acc[product.name] = 0;
          }
          acc[product.name] += item.quantity || 0;
        }
      });
      return acc;
    }, {});

    // Konversi ke format yang dibutuhkan chart
    return Object.entries(productSales)
      .map(([name, sales]) => ({ name, sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  }, [orders, products]);

  // Perhitungan statistik
  const stats = useMemo(() => {
    // Pastikan orders adalah array
    const safeOrders = Array.isArray(orders) ? orders : [];

    const totalRevenue = safeOrders.reduce((acc, order) => {
      return acc + (order.totalAmount || 0);
    }, 0);

    const completedOrders = safeOrders.filter(
      (order) => order.status === "Completed"
    );
    const pendingOrders = safeOrders.filter(
      (order) => order.status === "Pending"
    );

    return {
      totalProducts: products.length,
      totalRevenue,
      totalOrders: safeOrders.length,
      completedOrders: completedOrders.length,
      pendingOrders: pendingOrders.length,
      uniqueCustomers: new Set(
        safeOrders
          .map((order) => order.user?._id)
          .filter((id) => id !== undefined)
      ).size,
    };
  }, [products, orders]);

  // Format mata uang
  const formatCurrency = (value) => {
    return `${currency}${(value || 0).toLocaleString("id-ID")}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between flex-col lg:flex-row items-center mb-6">
        <div className="mb-6 text-2xl">
          <Title text1={"DASHBOARD"} text2={"OVERVIEW"} />
        </div>
        <div className="flex items-center space-x-2 text-gray-500">
          <RefreshCwIcon size={18} />
          <span>Last updated: {new Date().toLocaleString()}</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon="order"
          trend={10}
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon="revenue"
          trend={15}
        />
        <StatCard
          title="Unique Customers"
          value={stats.uniqueCustomers}
          icon="users"
          trend={8}
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon="products"
          trend={12}
        />
      </div>

      {/* Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <RevenueChart data={revenueData} />
        <OrderStatusChart orders={orders} />
        <SalesPerformanceChart products={products} orders={orders} />
        <TopProductsChart data={topProductsData} />
      </div>

      {/* Orders Table
      <div className="mt-8">
        <OrdersTable
          orders={orders.slice(0, 10).map((order) => ({
            ...order,
            user: {
              name:
                order.user?.name || order.customerName || "Unknown Customer",
            },
          }))}
        />
      </div> */}
    </motion.div>
  );
};

export default Dashboard;
