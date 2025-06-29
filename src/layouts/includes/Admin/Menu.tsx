
import React, { useState, useEffect } from 'react';
import { Menu, Spin } from 'antd';
import sidebar from './slidebar.config';
import useBaseHook from '@src/hooks/BaseHook'
import Link from 'next/link';
import useSWR from 'swr'
import usePermissionHook from '@src/hooks/PermissionHook'
import { makeUrl, getSidebarSelecteds, getRouteData } from '@src/helpers/routes'
import UrlPattern from 'url-pattern';

const MenuComponent = (props: any) => {
  const { router, t } = useBaseHook({ lang: ['menu'] })
  const { query } = router
  const { theme, onCollapseChange, isMobile, tReady, type, ...otherProps } = props
  const { checkPermission } = usePermissionHook()
  const [routerNames, setRouterNames] = useState(undefined)
  const { data: routeData } = useSWR(["getRouteData"], () => getRouteData());

  const getRouteName = () => {
    const routePath = router.pathname
    for (let routeName in routeData) {
      let routeElement = routeData[routeName]
      if (!routeElement.action) continue;
      if (routeElement.action.substr(5) === routePath) return routeName
    }
  }

  const currentRouteName = getRouteName()
  const { data: breadcums } = useSWR(Object.values(routeData || {}).length ? ["getSidebarSelecteds", currentRouteName, sidebar, routeData] : null, () => getSidebarSelecteds(currentRouteName, sidebar, routeData));

  useEffect(() => {
    let routerNamesT = (breadcums || []).map((breadcum: any) => breadcum.routeName)
    setRouterNames(routerNamesT)
  }, [breadcums])

  const generateMenus = (data: any) => {
    return data.map((item: any) => {
      if (item.children) {
        if (item.type === "group") {
          let children = generateMenus(item.children)
          if (!children.length) return;
          return (
            {
              type: 'group',
              key: item.routeName,
              label: <>
                {item.icon ? item.icon : ''}
                <span>{t(item.routeName)}</span>
              </>,
              children: children
            }
          );
        }
        else {
          let children = generateMenus(item.children)
          if (!children.length) return;
          return (
            {
              key: item.routeName,
              label: <>
                {item.icon ? item.icon : ''}
                <span>{t(item.routeName)}</span>
              </>,
              children: children
            }
          );
        }
      }

      if (!checkPermission(item.permissions)) return

      let pattern = new UrlPattern(routeData[currentRouteName].url);
      let queryT = { ...query, ...pattern.match(window.location.pathname) }
      let routeParams = { ...item.routeParams, ...queryT }
      let routeInfo = makeUrl(item.routeName, routeParams, routeData || {})

      const routeLang = {
        href: routeInfo.href || "",
        as: routeInfo.as || ""
      }

      return {
        key: item.routeName,
        label: <Link {...routeLang} >
          <a href={routeLang.as}>
            {item.icon ? item.icon : ''}
            <span>{t(item.routeName)}</span>
          </a>
        </Link>
      }
    }).filter((menu: any) => menu);
  }

  if (!routerNames || routerNames.length == 0) return <Spin className="spin" />

  return <Menu
    mode="inline"
    theme={theme}
    className="side-bar"
    items={generateMenus(sidebar)}
    defaultOpenKeys={routerNames}
    selectedKeys={[...routerNames].pop()}
    onClick={
      isMobile
        ? () => {
          onCollapseChange(true)
        }
        : undefined
    }
    {...otherProps}
  >
  </Menu>
}

export default MenuComponent
