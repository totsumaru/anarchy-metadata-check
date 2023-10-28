"use client"

import React, { useEffect, useState } from 'react';
import { ChevronDownIcon } from "@heroicons/react/24/outline";

type Attribute = {
  trait_type: string;
  value: string;
};

type JsonData = {
  name: string;
  description: string;
  attributes: Attribute[];
};

export default function Home() {
  const [data, setData] = useState<JsonData[]>([]); // 全てのデータ
  const [filteredData, setFilteredData] = useState<JsonData[]>([]);
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [checkboxState, setCheckboxState] = useState<Record<string, Record<string, boolean>>>({});
  const [loading, setLoading] = useState<boolean>(true);
  // アコーディオンの状態を管理するstate
  const [accordionState, setAccordionState] = useState<Record<string, boolean>>({});

  const toggleAccordion = (traitType: string) => {
    setAccordionState(prev => ({ ...prev, [traitType]: !prev[traitType] }));
  }

  useEffect(() => {
    // 全てのデータを取得
    const loadData = async () => {
      const loadedData: JsonData[] = [];
      for (let i = 1; i <= 1600; i++) {
        const response = await fetch(`/json/${i}.json`);
        const jsonData: JsonData = await response.json();
        loadedData.push(jsonData);
      }
      setData(loadedData);
    };
    loadData().then(() => setLoading(false));
  }, []);

  useEffect(() => {
    const newFilters: Record<string, string[]> = {};
    const newCheckboxState: Record<string, Record<string, boolean>> = {};

    data.forEach(item => {
      item.attributes.forEach(attr => {
        if (!newFilters[attr.trait_type]) {
          newFilters[attr.trait_type] = [];
        }
        if (!newFilters[attr.trait_type].includes(attr.value) && attr.value) {
          newFilters[attr.trait_type].push(attr.value);

          // Initialize checkbox state
          if (!newCheckboxState[attr.trait_type]) {
            newCheckboxState[attr.trait_type] = {};
          }
          newCheckboxState[attr.trait_type][attr.value] = false;
        }
      });
    });

    setFilters(newFilters);
    setCheckboxState(newCheckboxState);
  }, [data]);

  const handleCheckboxChange = (traitType: string, value: string) => {
    const currentCheckboxState = { ...checkboxState };

    // チェックボックスの状態を切り替える
    currentCheckboxState[traitType][value] = !currentCheckboxState[traitType][value];

    // 現在のチェックボックスの状態を調べる
    const allUnchecked = Object.values(currentCheckboxState).every(trait => {
      return Object.values(trait).every(checked => !checked);
    });

    setCheckboxState(currentCheckboxState);

    // フィルタリングするアイテムを選択
    const checkedAttributes: Attribute[] = [];
    Object.entries(currentCheckboxState).forEach(([key, values]) => {
      Object.entries(values).forEach(([val, isChecked]) => {
        if (isChecked) {
          checkedAttributes.push({ trait_type: key, value: val });
        }
      });
    });

    const newFilteredData = data.filter(item => {
      return checkedAttributes.every(attr => {
        return item.attributes.some(
          itemAttr => itemAttr.trait_type === attr.trait_type && itemAttr.value === attr.value
        );
      });
    });

    // 全てのチェックボックスが外れている場合、または、フィルタリングされたデータの長さが0の場合、「存在しない」と表示
    if (allUnchecked || newFilteredData.length === 0) {
      setFilteredData([{
        name: '存在しない',
        description: '',
        attributes: []
      }]);
    } else {
      setFilteredData(newFilteredData);
    }
  };

  if (loading) {
    return <div className="m-10">loading...</div>
  }

  return (
    <div className="flex p-10 space-x-10">
      {/* フィルター部分 */}
      <div className="w-1/3 p-5 border rounded shadow-lg">
        {Object.keys(filters).sort().map(traitType => (
          <div key={traitType} className="mb-1">
            <h3 className="mb-2 text-lg font-bold cursor-pointer flex items-center"
                onClick={() => toggleAccordion(traitType)}>
              {traitType}
              <span className="ml-2">
                <ChevronDownIcon
                  className={`w-5 h-5 transform transition-transform duration-300 ${accordionState[traitType] ? 'rotate-180' : ''}`}/>
              </span>
            </h3>
            {accordionState[traitType] && (
              <div className="">
                {filters[traitType].sort((a, b) => {
                  const prefixA = a.match(/[^\d]+/)?.[0] || '';  // 数字ではない部分を取得
                  const prefixB = b.match(/[^\d]+/)?.[0] || '';  // 数字ではない部分を取得
                  const numberA = a.match(/\d+/)?.[0] || '';  // 数字部分を取得
                  const numberB = b.match(/\d+/)?.[0] || '';  // 数字部分を取得

                  if (prefixA === prefixB) {
                    return parseInt(numberA) - parseInt(numberB);  // 同じ文字列の場合は数値としてソート
                  }

                  return prefixA.localeCompare(prefixB);  // 文字列部分を優先してソート
                }).map(value => (
                  <label key={value} className="block">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={checkboxState[traitType]?.[value] || false}
                      onChange={() => handleCheckboxChange(traitType, value)}
                    />
                    {value}
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div>
        {filteredData.map((item, index) => (
          <div key={index}>
            <h4>{item.name}</h4>
          </div>
        ))}
      </div>
    </div>
  );
}
