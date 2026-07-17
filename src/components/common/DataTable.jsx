import { Table, Tag, Space, Button, Input, DatePicker, Select } from 'antd'
import { SearchOutlined, FilterOutlined } from '@ant-design/icons'
import { useState } from 'react'

const { RangePicker } = DatePicker

function DataTable({
  columns,
  data,
  loading = false,
  pagination = { pageSize: 10, showSizeChanger: true, showTotal: (total) => `Total ${total} items` },
  onRowClick,
  filters = [],
  searchPlaceholder = 'Search...',
  scroll = { x: 800 },
  rowKey = 'id',
}) {
  const [searchText, setSearchText] = useState('')
  const [paginationState, setPaginationState] = useState({
    current: 1,
    pageSize: pagination?.pageSize || 10,
  })

  const handleSearch = (e) => {
    setSearchText(e.target.value)
  }

  const filteredData = data.filter((item) =>
    Object.values(item).some((val) =>
      String(val).toLowerCase().includes(searchText.toLowerCase())
    )
  )

  return (
    <div className="premium-card overflow-hidden">
      {/* Filters Bar */}
      {(filters.length > 0 || searchPlaceholder) && (
        <div className="p-4 border-b border-slate-50 flex flex-wrap items-center gap-3 bg-slate-50/30">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Input
              placeholder={searchPlaceholder}
              prefix={<SearchOutlined className="text-slate-400" />}
              value={searchText}
              onChange={handleSearch}
              className="rounded-xl border-slate-100"
              allowClear
            />
          </div>
          {filters.map((filter, index) => (
            <div key={index} className="flex items-center gap-2">
              {filter.type === 'select' && (
                <Select
                  placeholder={filter.placeholder}
                  style={{ width: 160 }}
                  allowClear
                  onChange={filter.onChange}
                  options={filter.options}
                  className="rounded-xl"
                />
              )}
              {filter.type === 'date' && (
                <RangePicker
                  placeholder={[filter.placeholderStart || 'Start', filter.placeholderEnd || 'End']}
                  onChange={filter.onChange}
                  className="rounded-xl"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey={rowKey}
        loading={loading}
        pagination={{
          ...paginationState,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`,
          onChange: (page, size) => {
            setPaginationState({ current: page, pageSize: size })
          },
          ...pagination
        }}
        scroll={scroll}
        onRow={(record) => ({
          onClick: () => onRowClick && onRowClick(record),
          className: 'cursor-pointer hover:bg-slate-50/50 transition-colors',
        })}
        bordered={false}
        className="ant-table-modern"
      />
    </div>
  )
}

export default DataTable
