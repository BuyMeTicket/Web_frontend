import React from 'react'
import { Link } from 'react-router-dom'
import {useAddress,useContractRead,useContract,useDisconnect } from "@thirdweb-dev/react";
import { GLOBAL_ADDRESS } from "../const/contractAddress";
import {
  CButton,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'

const AppHeaderDropdown = () => {
  const address = useAddress()
  const { contract: GlobalContract } = useContract(GLOBAL_ADDRESS);
  const {
    data: isEventHolder,
    isLoading: loadingIsEventHolder
  } = useContractRead(GlobalContract, "isEventHolders", [address])
  const disconnect = useDisconnect();
  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0" caret={false}>
        <CButton variant="ghost" color="dark" className="text-dark">
          <CIcon icon='cil-user' className='text-white' height='30' />
        </CButton>
      </CDropdownToggle>
      {isEventHolder ? (<CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="bg-light fw-semibold py-2">Your Space</CDropdownHeader>
        <CDropdownItem component={Link} to="/Whitelist">
          {/* <CIcon icon="cil-user" name="cil-user" className="me-2" /> */}
          Get Whitelist
        </CDropdownItem>
        <CDropdownItem component={Link} to="/Activity/Own">
          {/* <CIcon icon="cil-user" name="cil-user" className="me-2" /> */}
          My Activities
        </CDropdownItem>

        <CDropdownItem component={Link} to="/Pool/Own">
          {/* <CIcon icon="cil-user" name="cil-user" className="me-2" /> */}
          My Pool
        </CDropdownItem>

        <CDropdownItem component={Link} to="/Airdrops">
          {/* <CIcon icon="cil-user" name="cil-user" className="me-2" /> */}
          My Airdrop
        </CDropdownItem>
        <CDropdownItem component={Link} to="/Ticket/Own">
          {/* <CIcon icon="cil-user" name="cil-user" className="me-2" /> */}
          My Ticket
        </CDropdownItem>
        <CDropdownItem component={Link} to="/Pool/Fund">
          {/* <CIcon icon="cil-user" name="cil-user" className="me-2" /> */}
          My Fund
        </CDropdownItem>
        <CDropdownItem component={Link} to="/Faucet">
          {/* <CIcon icon="cil-user" name="cil-user" className="me-2" /> */}
          Token Faucet
        </CDropdownItem>
        <CDropdownDivider />
        <CDropdownItem onClick={disconnect}>
          {/* <CIcon icon="cil-lock-locked" name="cil-lock-locked" className="me-2" /> */}
          Logout
        </CDropdownItem>
      </CDropdownMenu>
      ):(
        <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="bg-light fw-semibold py-2">Your Space</CDropdownHeader>
        <CDropdownItem component={Link} to="/Whitelist">
          {/* <CIcon icon="cil-user" name="cil-user" className="me-2" /> */}
          Get Whitelist
        </CDropdownItem>
        
        <CDropdownItem component={Link} to="/Ticket/Own">
          {/* <CIcon icon="cil-user" name="cil-user" className="me-2" /> */}
          My Ticket
        </CDropdownItem>
        <CDropdownItem component={Link} to="/Pool/Fund">
          {/* <CIcon icon="cil-user" name="cil-user" className="me-2" /> */}
          My Fund
        </CDropdownItem>
        <CDropdownItem component={Link} to="/Faucet">
          {/* <CIcon icon="cil-user" name="cil-user" className="me-2" /> */}
          Token Faucet
        </CDropdownItem>
        <CDropdownDivider />
        <CDropdownItem onClick={disconnect}>
          {/* <CIcon icon="cil-lock-locked" name="cil-lock-locked" className="me-2" /> */}
          Logout
        </CDropdownItem>
      </CDropdownMenu>
      )}
    </CDropdown>
  )
}

export default AppHeaderDropdown
